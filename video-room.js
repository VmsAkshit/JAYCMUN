// video-room.js
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Get URL params
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const role = urlParams.get('role'); // 'host' or 'attendee'

let localTracks = {
    videoTrack: null,
    audioTrack: null
};

let remoteUsers = {};

async function joinAndDisplay() {
    // Event Listeners
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    // Join Channel
    const uid = await client.join(agoraConfig.appId, roomId, agoraConfig.token, null);

    // Create and publish local tracks
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

    // Display Local Video
    const localPlayerContainer = document.createElement("div");
    localPlayerContainer.id = `user-${uid}`;
    localPlayerContainer.className = "video-player";
    document.getElementById("video-container").append(localPlayerContainer);
    
    localTracks.videoTrack.play(localPlayerContainer);

    // Publish to channel
    await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
}

// Handle Remote Users
async function handleUserJoined(user, mediaType) {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
        let player = document.getElementById(`user-${user.uid}`);
        if (!player) {
            player = document.createElement("div");
            player.id = `user-${user.uid}`;
            player.className = "video-player";
            document.getElementById("video-container").append(player);
        }
        user.videoTrack.play(player);
    }

    if (mediaType === "audio") {
        user.audioTrack.play();
    }
}

function handleUserLeft(user) {
    delete remoteUsers[user.uid];
    const player = document.getElementById(`user-${user.uid}`);
    if (player) player.remove();
}

// --- Controls Logic ---

// Mute/Unmute Audio
document.getElementById('mic-btn').addEventListener('click', async (e) => {
    if (localTracks.audioTrack.muted) {
        await localTracks.audioTrack.setMuted(false);
        e.currentTarget.classList.remove('active');
        e.currentTarget.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
        await localTracks.audioTrack.setMuted(true);
        e.currentTarget.classList.add('active'); // Red color
        e.currentTarget.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
});

// Camera On/Off
document.getElementById('cam-btn').addEventListener('click', async (e) => {
    if (localTracks.videoTrack.muted) {
        await localTracks.videoTrack.setMuted(false);
        e.currentTarget.classList.remove('active');
        e.currentTarget.innerHTML = '<i class="fas fa-video"></i>';
    } else {
        await localTracks.videoTrack.setMuted(true);
        e.currentTarget.classList.add('active');
        e.currentTarget.innerHTML = '<i class="fas fa-video-slash"></i>';
    }
});

// Leave
document.getElementById('leave-btn').addEventListener('click', async () => {
    for (trackName in localTracks) {
        var track = localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
        }
    }
    await client.leave();
    window.location.href = "dashboard.html";
});

// Reactions (Visual only for now)
document.getElementById('react-btn').addEventListener('click', () => {
    const emoji = document.createElement('div');
    emoji.innerText = "👏";
    emoji.className = "reaction-emoji";
    document.body.appendChild(emoji);
    
    // Cleanup DOM after animation
    setTimeout(() => emoji.remove(), 2000);
});

// Initialize
joinAndDisplay();
