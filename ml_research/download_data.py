"""Download the UCI Cervical Cancer Risk Factors dataset."""
import urllib.request
import os
import ssl

def download_dataset():
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00383/risk_factors_cervical_cancer.csv"
    output_path = os.path.join(os.path.dirname(__file__), "risk_factors_cervical_cancer.csv")
    
    if os.path.exists(output_path):
        print(f"Dataset already exists at {output_path}")
        return output_path
    
    print(f"Downloading dataset from {url}...")
    
    # Try with SSL verification first, then without
    try:
        urllib.request.urlretrieve(url, output_path)
    except Exception as e1:
        print(f"First attempt failed: {e1}")
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
            urllib.request.install_opener(opener)
            urllib.request.urlretrieve(url, output_path)
        except Exception as e2:
            print(f"Second attempt failed: {e2}")
            # Try alternative URL
            alt_url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/risk_factors_cervical_cancer.csv"
            print(f"Trying alternative URL: {alt_url}")
            try:
                urllib.request.urlretrieve(alt_url, output_path)
            except Exception as e3:
                print(f"All download attempts failed: {e3}")
                print("Please download the dataset manually.")
                raise
    
    print(f"Dataset downloaded successfully to {output_path}")
    size = os.path.getsize(output_path)
    print(f"File size: {size} bytes")
    return output_path

if __name__ == "__main__":
    download_dataset()
