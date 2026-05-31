FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN python -m pip install --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt

COPY app1.py .

RUN useradd --create-home --shell /bin/bash appuser \
    && chown -R appuser:appuser /app 

USER appuser

EXPOSE 5000

CMD ["python","app1.py"]
