# https://docker-curriculum.com/#dockerfile, https://pnpm.io/docker
# I did initially try to use docker init but it looked overkill for what the app is
# I followed this tutorial + other reference dockerfiles to construct this
# In this commit didnt use any env stuff because the port appears to be hardcoded?
# Constants
ARG NODE_VER=24-slim
ARG PNPM_VER=10.20.0

FROM node:${NODE_VER} as base

WORKDIR /usr/src/app
# supposedly this optimises some of the copying
COPY pnpm-lock.yaml package.json ./
# alt/more modern way (i think?) of installing pnpm
RUN corepack enable
RUN pnpm install --frozen-lockfile


# copies everything for simplicity, dockerignore handles secrets
COPY . .
RUN pnpm run build

# for curl
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD [ "pnpm", "start" ]

