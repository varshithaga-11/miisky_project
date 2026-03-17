def get_file_parser(file_extension):
    """
    Returns a parser function based on file extension.
    Supported: .csv, .xlsx, .sql
    """
    if file_extension == ".csv":
        import pandas as pd
        return lambda content: pd.read_csv(content)
    elif file_extension == ".xlsx":
        import pandas as pd
        return lambda content: pd.read_excel(content)
    elif file_extension == ".sql":
        return lambda content: content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file extension: {file_extension}")
