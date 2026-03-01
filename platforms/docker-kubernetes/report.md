# Docker & Kubernetes Assessment Report

> [!TIP]
> Use this document to explain your design choices, optimisations and any challenges you faced.

## Dockerfile

<!-- TODO: (Optional) Explain any specific goals or design decisions -->
couldn't really decide between slim(debian) or alpine but debian has more functionality than alpine so went with the 'safer' one perse

need to clean up my copy . . after (am reading an article about optimisations), will change in the final commit hopefully (working on the other thing in ts commit)

### Forked repository

<!-- TODO: If you submitted your changes to a fork, replace with your forked repository -->
`https://github.com/your-username/academic-calendar-api`

## Kubernetes

initially (first few commits, will add numbering later)
- just trying to figure out k8s right now, so I'm following a few default guides + yt tutorials to get a just functional version of navidrome up
- concerns
  - seeing options for strategy (reboot options), but from my understanding the self healing nature of k8s is equivalent to the `restart: unless-stopped` in the docker compose? so i'm not sure if this needs to be specified
  - replicas: seeing that they're used for availability (>=2), but could cause data corruption with more than 1, need to research later
  - persistence: closest analogue to volumes: in docker-compose, i copied a generic pvc from someone's blog for now (https://andrewmichaelsmith.com/2020/11/migrating-from-google-music-to-navidrome-on-kubernetes/) as a reference