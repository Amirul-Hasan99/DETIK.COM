FROM python:3.9-slim

WORKDIR /code

# Copy backend requirements and install
COPY ./backend/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy all project files
# We need the backend folder as well as the root files (datasets, models)
COPY ./ /code/

# Huggingface spaces expose port 7860
EXPOSE 7860

# Command to run the FastAPI application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
