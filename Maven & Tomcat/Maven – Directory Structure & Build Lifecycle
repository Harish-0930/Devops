# Maven – Directory Structure & Build Lifecycle

## Directory Structure (Standard Layout)
```
my-project/
├── pom.xml                 # Project Object Model (project configuration)
└── src/
    ├── main/
    │   ├── java/           # Application source code
    │   ├── resources/      # App resources (properties, YAML)
    │   └── webapp/         # Web application files (WEB-INF, JSPs, HTML)
    ├── test/
    │   ├── java/           # Test source code
    │   └── resources/      # Test resources
    └── site/               # Optional Maven site
target/                     # Compiled classes, packages, build artifacts
```

## One-line purpose for each folder
- `pom.xml` – Main Maven configuration (dependencies, plugins, coordinates).
- `src/main/java/` – Application Java source code.
- `src/main/resources/` – Application resources (config files, static assets).
- `src/main/webapp/` – Web application contents for WAR packaging.
- `src/test/java/` – Unit & integration test sources.
- `src/test/resources/` – Test-specific resources.
- `src/site/` – Project site documentation.
- `target/` – Build output (classes, JAR/WAR, reports).

## Build Lifecycle (phases)
```
validate → compile → test → package → verify → install → deploy
```

## Commands to skip tests
- `mvn install -DskipTests` (compiles tests but does not run them)  
- `mvn install -Dmaven.test.skip=true` (does not compile or run tests)  
- `mvn clean install -DskipTests`

## Notes
- `-DskipTests` still compiles test classes; `-Dmaven.test.skip=true` skips compilation entirely.

End of Document
---

📘 **Author:** Munagala Harish  
📅 **Title:** *Directory Structure & Build Lifecycle*  
