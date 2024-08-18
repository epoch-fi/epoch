"""SQLDatabase Tool."""

from typing import Any, List, Optional

from llama_index.core.utilities.sql_wrapper import SQLDatabase
from llama_index.core.readers.base import BaseReader
from llama_index.core.schema import Document
from llama_index.core.tools.tool_spec.base import BaseToolSpec
from sqlalchemy import MetaData, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import NoSuchTableError
from sqlalchemy.schema import CreateTable


class SQLDatabaseToolSpec(BaseToolSpec, BaseReader):
    """
    A tool to query and retrieve results from a SQL Database.

    Args:
        sql_database (Optional[SQLDatabase]): SQL database to use,
            including table names to specify.
            See :ref:`Ref-Struct-Store` for more details.

        OR

        engine (Optional[Engine]): SQLAlchemy Engine object of the database connection.

        OR

        uri (Optional[str]): uri of the database connection.

        OR

        scheme (Optional[str]): scheme of the database connection.
        host (Optional[str]): host of the database connection.
        port (Optional[int]): port of the database connection.
        user (Optional[str]): user of the database connection.
        password (Optional[str]): password of the database connection.
        dbname (Optional[str]): dbname of the database connection.

    """

    spec_functions = ["run_sql_query", "describe_tables", "list_tables"]

    def __init__(
        self,
        sql_database: Optional[SQLDatabase] = None,
        engine: Optional[Engine] = None,
        uri: Optional[str] = None,
        scheme: Optional[str] = None,
        host: Optional[str] = None,
        port: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        dbname: Optional[str] = None,
        *args: Optional[Any],
        **kwargs: Optional[Any],
    ) -> None:
        """Initialize with parameters."""
        if sql_database:
            self.sql_database = sql_database
        elif engine:
            self.sql_database = SQLDatabase(engine, *args, **kwargs)
        elif uri:
            self.uri = uri
            self.sql_database = SQLDatabase.from_uri(uri, *args, **kwargs)
        elif scheme and host and port and user and password and dbname:
            uri = f"{scheme}://{user}:{password}@{host}:{port}/{dbname}"
            self.uri = uri
            self.sql_database = SQLDatabase.from_uri(uri, *args, **kwargs)
        else:
            raise ValueError(
                "You must provide either a SQLDatabase, "
                "a SQL Alchemy Engine, a valid connection URI, or a valid "
                "set of credentials."
            )
        self._metadata = MetaData()
        self._metadata.reflect(bind=self.sql_database.engine)

    def run_sql_query(self, query: str) -> Document:
        """Runs SQL query on the provided SQL database, returning a Document storing all the rows separated by \n.

        Args:
            query (str): SQL query in text format which can directly be executed using SQLAlchemy engine. 

        Returns:
            Document: Document storing all the output result of the sql-query generated.
        """
        with self.sql_database.engine.connect() as connection:
            if query is None:
                raise ValueError("A query parameter is necessary to filter the data")
            else:
                result = connection.execute(text(query))
            all_doc_str = ""
            for item in result.fetchall():
                if all_doc_str:
                    all_doc_str += "\n"
                # fetch each item
                doc_str = ", ".join([str(entry) for entry in item])
                all_doc_str += doc_str
            return Document(text=all_doc_str)

    def list_tables(self) -> List[str]:
        """
        Returns a list of available tables in the database.
        To retrieve details about the columns of specfic tables, use
        the describe_tables endpoint
        """
        return list(map(lambda x: x.name, self._metadata.sorted_tables))

    def describe_tables(self, tables: Optional[List[str]] = None) -> str:
        """
        Describes the specifed tables in the database

        Args:
            tables (List[str]): A list of table names to retrieve details about
        """
        table_names = tables or [table.name for table in self._metadata.sorted_tables]
        table_schemas = []

        for table_name in table_names:
            table = next(
                (
                    table
                    for table in self._metadata.sorted_tables
                    if table.name == table_name
                ),
                None,
            )
            if table is None:
                raise NoSuchTableError(f"Table '{table_name}' does not exist.")
            schema = str(CreateTable(table).compile(self.sql_database._engine))
            table_schemas.append(f"{schema}\n")

        return "\n".join(table_schemas)

