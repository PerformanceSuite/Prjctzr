# PROJECT_NAME - Python Project

This file provides guidance to Claude Code when working with this Python project.

## Project Overview
**Project:** PROJECT_NAME
**Location:** PROJECT_PATH
**Type:** Python
**DevAssist:** Initialized PROJECT_DATE

## Technology Stack
- **Language:** Python
- **Package Manager:** pip/poetry/conda
- **Virtual Environment:** venv/virtualenv/conda
- **Frameworks:** Will be detected (Django, Flask, FastAPI, etc.)

## Common Commands
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt

# Run application
python main.py
# or for Django
python manage.py runserver
# or for Flask
flask run

# Run tests
pytest
# or
python -m unittest discover

# Format code
black .
# or
autopep8 --in-place --recursive .
```

## Session Commands
After restarting Claude Code:
- `/session-start` - Start development session with DevAssist
- `/session-end` - End session with summary
- `/session-checkpoint` - Save progress checkpoint

## Python Best Practices
- Follow PEP 8 style guide
- Use type hints for better code clarity
- Write docstrings for functions and classes
- Keep requirements.txt up to date
- Use virtual environments for isolation
- Write unit tests with pytest or unittest

## Project Structure
```
PROJECT_NAME/
├── src/                 # Source code
├── tests/               # Test files
├── docs/                # Documentation
├── requirements.txt     # Dependencies
├── setup.py            # Package configuration
├── venv/               # Virtual environment
└── .devassist/         # DevAssist data (isolated)
```

## DevAssist Features
- Isolated knowledge base for this project
- Terminal logging in .devassist/terminal_logs/
- Python-specific code analysis
- Framework detection (Django, Flask, FastAPI)
- pip/poetry command suggestions
- Virtual environment awareness