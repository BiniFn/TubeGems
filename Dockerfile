FROM node:20-bookworm

WORKDIR /app

# Install Python and pip for backend runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching
COPY package.json ./
COPY requirements.txt ./
RUN npm install && pip3 install --no-cache-dir -r requirements.txt

# Copy source and build frontend assets
COPY . .
RUN npm run build

ENV PORT=5000
EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "main:app"]
