import pandas as pd
import pdfplumber
import io

def parse_excel(file_content):
    """
    Parses Excel file content and returns a list of dictionaries.
    """
    df = pd.read_excel(io.BytesIO(file_content))
    # Fill NaN with None for JSON compatibility
    df = df.where(pd.notnull(df), None)
    return df.to_dict(orient='records')

def parse_pdf(file_content):
    """
    Parses PDF file content and returns a list of dictionaries.
    Note: PDF parsing can be tricky and depend on the format.
    This implementation assumes a table-like structure in the PDF.
    """
    data = []
    with pdfplumber.open(io.BytesIO(file_content)) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if table:
                headers = table[0]
                for row in table[1:]:
                    data.append(dict(zip(headers, row)))
    return data

def get_file_parser(file_extension):
    if file_extension in ['.xlsx', '.xls']:
        return parse_excel
    elif file_extension == '.pdf':
        return parse_pdf
    else:
        raise ValueError(f"Unsupported file extension: {file_extension}")
