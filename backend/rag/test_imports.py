"""Test script to verify imports and basic functionality.

Run this script from the project root with:
    python -m backend.rag.test_imports
"""
import asyncio
import sys
from pathlib import Path

def print_status(msg, success=True):
    """Print a status message with color."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    RESET = '\033[0m'
    color = GREEN if success else RED
    print(f"{color}{'✓' if success else '✗'} {msg}{RESET}")

async def main():
    # Print Python path for debugging
    print("\nPython path:")
    for p in sys.path:
        print(f"  {p}")
    
    print("\nTesting imports...")
    
    # Test relative imports
    try:
        from .llm import LLMClient
        from .rag import rag, generate_response
        print_status("Successfully imported from relative paths")
    except ImportError as e:
        print_status(f"Failed to import using relative paths: {e}", False)
    
    # Test absolute imports
    try:
        from backend.rag.llm import LLMClient as LLMClient2
        from backend.rag.rag import rag as rag2
        print_status("Successfully imported from absolute paths")
    except ImportError as e:
        print_status(f"Failed to import using absolute paths: {e}", False)
    
    print("\nTesting functionality...")
    
    # Test LLMClient
    try:
        client = LLMClient()
        response = await client.a_call("test prompt")
        print_status(f"LLMClient.a_call() works: {response}")
    except Exception as e:
        print_status(f"LLMClient test failed: {e}", False)
    
    # Test rag class
    try:
        r = rag()
        response = await r.testllm("test prompt")
        print_status(f"rag.testllm() works: {response}")
    except Exception as e:
        print_status(f"rag test failed: {e}", False)
    
    # Test generate_response
    try:
        response = await generate_response("test query")
        print_status(f"generate_response() works: {response}")
    except Exception as e:
        print_status(f"generate_response test failed: {e}", False)

if __name__ == "__main__":
    # Check if running as module
    if not any(Path(p).resolve() == Path(__file__).parent.parent.parent.resolve() 
               for p in sys.path):
        print("\n⚠️  Warning: Project root not in PYTHONPATH")
        print("Run this script as a module from the project root:")
        print("    python -m backend.rag.test_imports")
        sys.exit(1)
    
    asyncio.run(main())