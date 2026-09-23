FROM ruby:3.4.4-slim

# Build context: repo root (docker build -f .devops/Dockerfile .)
# Platform: x86_64-linux-gnu (glibc) — slim Debian base required for pre-compiled pg/nokogiri gems

RUN apt-get update -qq \
 && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Pin Bundler to the version recorded in Gemfile.lock
RUN gem install bundler -v 2.6.7 --no-document

WORKDIR /app

# Enable Rails to serve precompiled assets from /public/assets
ENV RAILS_ENV=production
ENV RAILS_SERVE_STATIC_FILES=true

# Install gems before copying the full source
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4 --retry 3 --without development test

# Copy application source
COPY . .

# Precompile Rails assets during Docker build
RUN SECRET_KEY_BASE_DUMMY=1 \
    RAILS_ENV=production \
    bundle exec rails assets:precompile

# Create runtime directories expected by Puma and Rails
RUN mkdir -p tmp/pids log storage

# Make startup script executable
RUN chmod +x bin/start_app.sh

EXPOSE 3000

CMD ["bin/start_app.sh"]