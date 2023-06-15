from pydantic import BaseSettings


class Settings(BaseSettings):
    account: str

    class Config:
        env_file = ".env"