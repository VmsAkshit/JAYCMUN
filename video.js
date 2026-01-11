// video.js
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

let localTracks = {
    audioTrack: null,
    videoTrack: null
};

async function startConference() {
    if(!roomId) { alert("No Room ID provided"); window.location.href = "dashboard.html"; }

    // Join Agora Channel
    // Note: Token is set to null for testing. For production, you need a token server.
    const uid = await client.join(agoraAppId, roomId, null, null);

    // Create Mic and Camera tracks
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

    // Play Local Video
    const localPlayer = document.createElement('div');
    localPlayer.className = 'video-frame';
    localPlayer.id = `user-${uid}`;
    document.getElementById('video-grid').append(localPlayer);
    localTracks.videoTrack.play(localPlayer);

    // Publish to others
    await client.publish(Object.values(localTracks));

    // Handle when others join
    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
            const remotePlayer = document.createElement('div');
            remotePlayer.className = 'video-frame';
            remotePlayer.id = `user-${user.uid}`;
            document.getElementById('video-grid').append(remotePlayer);
            user.videoTrack.play(remotePlayer);
        }
        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    });

    client.on("user-unpublished", (user) => {
        const player = document.getElementById(`user-${user.uid}`);
        if(player) player.remove();
    });
}

// Controls
document.getElementById('mic-btn').addEventListener('click', async (e) => {
    if(localTracks.audioTrack.muted) {
        await localTracks.audioTrack.setMuted(false);
        e.target.closest('button').style.backgroundColor = '#333';
    } else {
        await localTracks.audioTrack.setMuted(true);
        e.target.closest('button').style.backgroundColor = '#e53935';
    }
});

document.getElementById('cam-btn').addEventListener('click', async (e) => {
    if(localTracks.videoTrack.muted) {
        await localTracks.videoTrack.setMuted(false);
        e.target.closest('button').style.backgroundColor = '#333';
    } else {
        await localTracks.videoTrack.setMuted(true);
        e.target.closest('button').style.backgroundColor = '#e53935';
    }
});

document.getElementById('leave-btn').addEventListener('click', async () => {
    localTracks.audioTrack.close();
    localTracks.videoTrack.close();
    await client.leave();
    window.location.href = "dashboard.html";
});

startConference();
