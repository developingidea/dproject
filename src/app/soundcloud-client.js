function SoundCloud() {
	this.clientId = 'b07647ddc8d151245fe17e491af8299d';
	SC.initialize({
		client_id: this.clientId,
		redirect_uri: ''
	});
}
// https://api.soundcloud.com/resolve.json?url=https://soundcloud.com/thebpmfestival/sets/bpm2016-artist-sets&client_id=b07647ddc8d151245fe17e491af8299d
//9165886
SoundCloud.prototype.loadTracks = function (tracksLoadedCallBack) {
	var self = this;
	SC.get('/playlists/189322959/tracks', {}, function(soundCloudTracks, error){
		if (!!error) {
			alert('Error loading connecting to SoundCloud: ' + error.message);
		}
		var trackCount = soundCloudTracks.length;
		self.tracks = [];
		for (var i = 0; i < trackCount; i++) {
			var soundCloudTrack = soundCloudTracks[i];
			if (soundCloudTrack.streamable) {
				console.log(soundCloudTrack)
				self.tracks.push(self.convertTrack(soundCloudTrack));
			}
		}
		tracksLoadedCallBack();
	});
}

SoundCloud.prototype.convertTrack = function (soundCloudTrack) {
	var trackInfo = new TrackInfo();
	trackInfo.url = soundCloudTrack.stream_url + '?client_id=' + this.clientId;
	trackInfo.title = soundCloudTrack.title;
	trackInfo.durationMs = soundCloudTrack.duration;
	return trackInfo;
}
