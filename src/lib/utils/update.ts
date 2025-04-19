import info from "../../../package.json"

const localVersion = info.version

main = function(cb: (a: boolean, release?: string) => void) {
  const url = `https://api.github.com/repos/Kavakuo/MuseScore-Plugins/releases/latest`;

  //@ts-ignore
  const xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          const latestVersion = response.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present

          const isNewer = compareVersions(latestVersion, localVersion);
          cb(isNewer, response.body ?? "");
        } catch (error) {
          console.log(`Error parsing response: ${error}`);
          cb(false)
        }
      } else {
        console.log(`Request failed with status: ${xhr.status}`);
        cb(false)
      }
    }
  };

  xhr.onerror = () => {
    console.log('Network error occurred');
    cb(false)
  };

  xhr.send();
}

function compareVersions(latest: string, local: string): boolean {
  const latestParts = latest.split('.').map(Number);
  const localParts = local.split('.').map(Number);

  for (let i = 0; i < Math.max(latestParts.length, localParts.length); i++) {
    const latestPart = latestParts[i] || 0;
    const localPart = localParts[i] || 0;

    if (latestPart > localPart) {
      return true;
    } else if (latestPart < localPart) {
      return false;
    }
  }

  return false;
}