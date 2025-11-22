from setuptools import setup, find_packages

setup(
    name="fundthesis",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "asyncio",
        # Add other dependencies as needed
    ],
    python_requires=">=3.7",
)