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

### commit 1
just trying to figure out k8s right now, so I'm following a few default guides + yt tutorials to get a just functional version of navidrome up
#### concerns
  - seeing options for a strategy header (reboot options), but from my understanding the self healing nature of k8s is equivalent to the `restart: unless-stopped` in the docker compose? so i'm not sure if this needs to be specified
  - replicas: seeing that they're used for availability (>=2), but could cause data corruption with more than 1, need to research later
  - persistence: closest analogue to volumes in docker-compose. i copied a generic pvc from someone's blog for now (https://andrewmichaelsmith.com/2020/11/migrating-from-google-music-to-navidrome-on-kubernetes/) as a reference


### commit 2
I managed to get PVC working in this commit

some struggles:
- maybe I didn't look through the docs enough but the beginning docs only described how to implement PVC w.r.t a Pod config, while I had previously established that Pods shouldn't be explicitly defined and generated using the deployment/service...

- I figured out (guessed) that since volumes/containers work at the same level they probabl should be generated under spec in deployment? And the definitions described for the pod had the storage working persistently so I'll take it.

- Just leaving the port as ClusterIP, as far as I can tell NodePort just exposes the app to 'external clients' which probably isn't needed in this case for a small local hosted app thing

https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/ https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/

using ts

https://stackoverflow.com/questions/56450272/can-we-get-persistent-volume-with-only-pvc-without-pv-in-k8s and ts 

justification for pvc: this is a locally hosted app (as said in the spec) so it makes sense to have locally hosted/physical storage being used, and obviously for a music player/storer if you shut down your app and lost everything that would be pretty bad...

also networking wise I just used ClusterIP because thats the first thing I saw, but not sure if 'hosting on localhost' means port forwarding is allowed? man i should've started this earlier

https://medium.com/@jeetanshu/understanding-kubernetes-services-clusterip-and-nodeport-0f9e0066a78a reading through this for the networking stuff + the docs
