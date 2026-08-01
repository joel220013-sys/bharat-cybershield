import email
import re
from email import policy

import numpy as np
import pdfplumber
import easyocr

from pdf2image import convert_from_path


# -------------------------------------------------
# Poppler Path (Windows)
# -------------------------------------------------

POPPLER_PATH = r"C:\poppler-26.02.0\Library\bin"


# -------------------------------------------------
# Main Parser
# -------------------------------------------------

def parse_email_file(file_path: str):

    file_path = file_path.lower()

    if file_path.endswith(".txt"):
        return parse_txt(file_path)

    elif file_path.endswith(".pdf"):
        return parse_pdf(file_path)

    elif file_path.endswith(".eml"):
        return parse_eml(file_path)

    raise Exception("Unsupported file type")


# -------------------------------------------------
# Helper
# -------------------------------------------------

def extract_header(text, header):

    match = re.search(
        rf"{header}\s*:\s*(.+)",
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    return ""


# -------------------------------------------------
# TXT Parser
# -------------------------------------------------

def parse_txt(file_path):

    with open(
        file_path,
        "r",
        encoding="utf-8",
        errors="ignore"
    ) as f:

        text = f.read()

    sender = extract_header(text, "From")
    subject = extract_header(text, "Subject")

    if sender == "":

        emails = re.findall(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text
        )

        if emails:
            sender = emails[0]

    return {

        "sender": sender,

        "receiver": "",

        "subject": subject,

        "body": text

    }


# -------------------------------------------------
# OCR Helper
# -------------------------------------------------

def extract_text_using_ocr(file_path):

    print("=" * 80)
    print("Using EasyOCR...")
    print("=" * 80)

    images = convert_from_path(
        file_path,
        poppler_path=POPPLER_PATH
    )

    reader = easyocr.Reader(
        ["en"],
        gpu=False
    )

    text = ""

    for page_no, image in enumerate(images, start=1):

        print(f"OCR Page {page_no}")

        image_np = np.array(image)

        results = reader.readtext(image_np)

        for result in results:

            text += result[1] + "\n"

    return text


# -------------------------------------------------
# PDF Parser
# -------------------------------------------------

def parse_pdf(file_path):

    text = ""

    # ---------------------------------------------
    # Try PDF Text Extraction
    # ---------------------------------------------

    try:

        with pdfplumber.open(file_path) as pdf:

            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

    except Exception as e:

        print("PDFPlumber Error:", e)

    # ---------------------------------------------
    # OCR Fallback
    # ---------------------------------------------

    if len(text.strip()) < 20:

        print("No selectable text found.")
        print("Switching to OCR...")

        try:

            text = extract_text_using_ocr(file_path)

        except Exception as e:

            print("OCR Error:", e)
            text = ""

    # ---------------------------------------------
    # Clean OCR Text
    # ---------------------------------------------

    text = text.replace("\r", "")

    text = text.replace("https:Il", "https://")
    text = text.replace("https:ll", "https://")
    text = text.replace("http:Il", "http://")
    text = text.replace("http:ll", "http://")

    text = text.replace("mail-google com", "mail.google.com")
    text = text.replace("mail google com", "mail.google.com")

    print("=" * 80)
    print("FINAL EXTRACTED TEXT")
    print("=" * 80)
    print(text)
    print("=" * 80)

    sender = ""
    receiver = ""
    subject = ""

    # ---------------------------------------------
    # Sender Detection
    # ---------------------------------------------

    # ---------------------------------------------
    # Detect Sender (Prefer non-Gmail sender)
    # ---------------------------------------------

    matches = re.findall(
        r"([A-Za-z0-9 ._-]+)\s*<([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})>",
        text
    )

    for name, email_addr in matches:

        if (
            "gmail.com" not in email_addr.lower()
            and "googlemail.com" not in email_addr.lower()
        ):
            sender = email_addr
            break

    # Fallback
    if sender == "" and len(matches) > 0:
        sender = matches[0][1]

    # ---------------------------------------------
    # Receiver
    # ---------------------------------------------

    receiver_match = re.search(

        r"To:\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})",

        text,

        re.IGNORECASE

    )

    if receiver_match:

        receiver = receiver_match.group(1)

    # ---------------------------------------------
    # Email Fallback
    # ---------------------------------------------

    if sender == "":

        emails = re.findall(

            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",

            text

        )

        if emails:

            for email_addr in emails:

                if (
                    email_addr != receiver
                    and "gmail.com" not in email_addr.lower()
                ):

                    sender = email_addr
                    break

            if sender == "":

                sender = emails[0]

    # ---------------------------------------------
    # Subject Detection
    # ---------------------------------------------

    subject = extract_header(text, "Subject")

    if subject == "":

        lines = [

            line.strip()

            for line in text.splitlines()

            if line.strip()

        ]

        keywords = [

            "payment",
            "successful",
            "transaction",
            "invoice",
            "alert",
            "verify",
            "verification",
            "otp",
            "security",
            "refund",
            "bank",
            "account"

        ]

        for line in lines:

            lower = line.lower()

            if any(word in lower for word in keywords):

                subject = line

                break

    return {

        "sender": sender,

        "receiver": receiver,

        "subject": subject,

        "body": text

    }


# -------------------------------------------------
# EML Parser
# -------------------------------------------------

def parse_eml(file_path):

    with open(file_path, "rb") as f:

        msg = email.message_from_binary_file(
            f,
            policy=policy.default
        )

    sender = msg.get("From", "")

    receiver = msg.get("To", "")

    subject = msg.get("Subject", "")

    body = ""

    if msg.is_multipart():

        for part in msg.walk():

            if (
                part.get_content_type() == "text/plain"
                and part.get_content_disposition() is None
            ):

                body += part.get_content()

    else:

        body = msg.get_content()

    return {

        "sender": sender,

        "receiver": receiver,

        "subject": subject,

        "body": body

    }