def call() {
    sh 'docker build -t "$REPO:$TAG" .'
}
