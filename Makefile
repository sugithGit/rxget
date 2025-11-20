# FVM Flutter and Dart paths
FLUTTER := fvm flutter
DART := fvm dart

## Flutter related commands

# Command to run build_runner
.PHONY: build
build:
	@echo "🏗️  Running build_runner for code generation..."
	@echo "----------------------------------------"
	@$(DART) run build_runner build --delete-conflicting-outputs -d
	@echo ""
	@echo "----------------------------------------"
	@echo "✅ Code generation completed!"

# Command to start development workflow
.PHONY: start
start:
	@echo "🚀 Initializing development environment..."
	@echo "----------------------------------------"
	@echo "📝 Formatting the dart files"
	@$(DART) format .
	@echo "🚀 Running the app"
	@$(FLUTTER) run

# Command to clean the project
.PHONY: clean
clean:
	@echo "🧹 Cleaning project..."
	@$(FLUTTER) clean
	@$(FLUTTER) pub get
	@echo "🏗️  Running build_runner for code generation..."
	@echo "----------------------------------------"
	@$(DART) run build_runner build --delete-conflicting-outputs -d
	@echo ""
	@echo "----------------------------------------"
	@echo "✅ Code generation completed!"

# Command to run tests
.PHONY: test
test:
	@echo "🧪 Running tests..."
	@$(FLUTTER) test

# Command to run before pushing the code
.PHONY: done
done:
	@echo ""
	@echo "🚀 Getting project for Merge Request..."
	@echo "----------------------------------------"
	@echo "📝 Formatting the dart files"
	@$(DART) format .
	@echo "🧹 Cleaning the dart files"
	@$(FLUTTER) clean
	@echo ""
	@echo "📦 Fetching the necessary packages"
	@$(FLUTTER) pub get
	@echo ""
	@echo "🔨 Generating necessary files..."
	@$(DART) run build_runner build -d
	@echo ""
	@echo "------------------------------"
	@echo "🚀 Code ready for Merge Request! 🚀🚀🚀"

## Git related commands

# Command to pull the latest changes from the dev branch
.PHONY: pull
pull:
	git pull origin master

# Command to run dart fix
.PHONY: fix
fix:
	@echo "🏗️  Running dart fix..."
	@echo "----------------------------------------"
	@$(DART) fix --apply
	@echo ""
	@echo "----------------------------------------"
	@echo "✅ Fix completed!"