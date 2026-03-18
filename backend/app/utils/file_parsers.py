import io
import pandas as pd

def get_file_parser(file_extension):
    """
    Returns a parser function based on file extension.
    Supported: .csv, .xls, .xlsx, .sql
    """
    if file_extension == ".csv":
        return lambda content: pd.read_csv(io.BytesIO(content)).to_dict(orient='records')
    elif file_extension in [".xlsx", ".xls"]:
        return lambda content: pd.read_excel(io.BytesIO(content)).to_dict(orient='records')
    elif file_extension == ".sql":
        return lambda content: content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file extension: {file_extension}")
