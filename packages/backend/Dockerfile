# Use official Ruby image
FROM ruby:3.2.2-slim

# Install dependencies including AWS CLI requirements
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  nodejs \
  npm \
  postgresql-client \
  libvips \
  git \
  curl \
  unzip \
  && rm -rf /var/lib/apt/lists/*

# Install AWS CLI (must be after unzip is installed)
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awsclip.zip" && \
    unzip awsclip.zip && \
    ./aws/install && \
    rm -rf awsclip.zip aws

# Set working directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN gem install bundler && \
    bundle config set without 'development test' && \
    bundle config set path '/usr/local/bundle' && \
    bundle install --jobs 4

# Copy the rest of the application
COPY . .

# Create directories for Active Storage and logs
RUN mkdir -p bin tmp/pids tmp/storage log

# Precompile assets (if you have any frontend assets)
# RUN bundle exec rails assets:precompile
# RUN bundle binstubs bundler rake rails

# Add a script to be executed every time the container starts
COPY docker-entrypoint.sh /usr/bin/docker-entrypoint.sh
RUN chmod +x /usr/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
