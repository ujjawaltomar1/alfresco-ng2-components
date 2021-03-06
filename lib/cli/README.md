# Alfresco ADF Cli


## The Goal of ADF CLI

The ADF CLI manages, builds , doc and test your ADF Application projects. 


## Installation
To get started  follow these instructions:

``
npm install @alfresco/adf-cli -g
``

### License Check

Move in the folder where you have your package.json and run the command:

```bash
npm install

adf-license
```
### Audit Check

Move in the folder where you have your package.json and run the command:

```bash
npm install

adf-audit
```

### Docker publish

Move in the folder where you have your Dockerfile and run the command:

```bash
adf-cli docker-publish --dockerRepo "${docker_repository}"  --dockerTags "${TAGS}" --pathProject "$(pwd)"
```

If you want to specify a different docker registry you can run
```bash
--loginCheck --loginUsername "username" --loginPassword "password" --loginRepo "quay.io"--dockerRepo "${docker_repository}"  --dockerTags "${TAGS}" --pathProject "$(pwd)"
```

### Kubectl update pod image

This command allows you to update a specific service on the rancher env with a specifig tag

```bash
adf-cli kubectl-image --clusterEnv ${clusterEnv} --clusterUrl ${clusterUrl} --username ${username} --token ${token} --deployName ${deployName} --dockerRepo ${dockerRepo} --tag ${tag}
```

You can use the option --installCheck to install kubectl as part of the command
