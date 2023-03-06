export const elasticSearch = {
  networks: {
    apim: {
      name: 'apim'
    },
    storage: {
      name: 'storage'
    }
  },
  volumes: {
    "data-elasticsearch": null
  },
  services: {
    "image": "docker.elastic.co/elasticsearch/elasticsearch:7.17.7",
    "container_name": "gravitee-apim-e2e-elasticsearch",
    "restart": "always",
    "volumes": [
      "data-elasticsearch:/usr/share/elasticsearch/data"
    ],
    "environment": [
      "http.host=0.0.0.0",
      "transport.host=0.0.0.0",
      "xpack.security.enabled=false",
      "xpack.monitoring.enabled=false",
      "cluster.name=elasticsearch",
      "bootstrap.memory_lock=true",
      "discovery.type=single-node",
      "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ],
    "ulimits": {
      "memlock": {
        "soft": -1,
        "hard": -1
      },
      "nofile": 65536
    },
    "healthcheck": {
      "test": [
        "CMD",
        "curl",
        "-f",
        "http://localhost:9200/_cat/health?h=st"
      ],
      "interval": "2s",
      "timeout": "10s",
      "retries": 30
    },
    "networks": [
      "storage"
    ]
  }
};

export const mongodb = {
  networks: {
    apim: {
      name: 'apim'
    },
    storage: {
      name: 'storage'
    }
  },
  volumes: {
    "data-mongo": null
  },
  services: {
    "image": "mongo:${MONGODB_VERSION}",
    "container_name": "gravitee-apim-e2e-mongodb",
    "restart": "always",
    "ports": [
      "30017:27017"
    ],
    "volumes": [
      "data-mongo:/data/db",
      "./.logs/apim-mongodb:/var/log/mongodb"
    ],
    "healthcheck": {
      "test": "echo 'db.runCommand({serverStatus:1}).ok' | mongo admin --quiet | grep 1",
      "interval": "2s",
      "timeout": "10s",
      "retries": 5
    },
    "networks": [
      "storage"
    ]
  }
};