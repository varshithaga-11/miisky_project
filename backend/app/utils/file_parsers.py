import io
import pandas as pd

def get_file_parser(file_extension):
    """
    Returns a parser function based on file extension.
    Supported: .csv, .xls, .xlsx, .sql
    """
    if file_extension == ".csv":
        def parse_csv(content):
            df = pd.read_csv(io.BytesIO(content))
            return df.where(pd.notnull(df), None).to_dict(orient='records')
        return parse_csv
    elif file_extension in [".xlsx", ".xls"]:
        def parse_excel(content):
            df = pd.read_excel(io.BytesIO(content))
            return df.where(pd.notnull(df), None).to_dict(orient='records')
        return parse_excel
    elif file_extension == ".sql":
        return lambda content: content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file extension: {file_extension}")
