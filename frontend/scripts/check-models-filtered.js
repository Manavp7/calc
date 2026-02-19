
const apiKey = "AIzaSyBGIpSdjYdcTTFAPCwgoDVoQUkoP9KH_38";

async function listModels() {
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Matched Models:");
            // Filter for "pro" or "2.0" or "1.5"
            const matches = data.models.filter(m =>
                m.name.includes('pro') ||
                m.name.includes('2.0') ||
                m.name.includes('1.5')
            );

            matches.forEach(m => {
                console.log(`- ${m.name}`);
            });
        } else {
            console.error("Failed to list models:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
