const urls = new Map();
urls.set("viaversion", "https://hangar.papermc.io/ViaVersion/ViaVersion/versions?channel=Release&channel=Snapshot&platform=PAPER&platform=VELOCITY");
urls.set("viabackwards", "https://hangar.papermc.io/ViaVersion/ViaBackwards/versions?channel=Release&channel=Snapshot&platform=PAPER&platform=VELOCITY");
urls.set("viarewind", "https://hangar.papermc.io/ViaVersion/ViaRewind/versions?channel=Release&channel=Snapshot&platform=PAPER&platform=VELOCITY");
urls.set("viarewindlegacysupport", "https://hangar.papermc.io/ViaVersion/viaRewindlegacysupport/versions?channel=Release&channel=Snapshot&platform=PAPER");
urls.set("viasponge", "https://modrinth.com/mod/viasponge/versions");
Promise.all(
    [...urls.entries()].map(async ([key, value]) => {
        try {
            if (value.includes("hangar")) {
                const req = await fetch("https://hangar.papermc.io/api/v1/projects/" + key + "/versions?limit=1&offset=0");
                if (req.status === 200) {
                    let d = (await req.json()).result[0].downloads['PAPER'].downloadUrl;
                    urls.set(key, d);
                }
            } else if (value.includes("modrinth")) {
                const req = await fetch("https://api.modrinth.com/v2/project/" + key + "/version?limit=1&offset=0");
                if (req.status === 200) {
                    let d = (await req.json())[0].files[0].url;
                    urls.set(key, d);
                }
            }
        } catch (e) {
            console.warn(e);
        }
    })
);