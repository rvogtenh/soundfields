class Recorder {
  constructor(audioContext, playerId, filesystem) {
    this.audioContext = audioContext;
    this.recorder = null;
    this.isRecording = false;
    this.stream = null;
    this.audioChunks = [];
    this.latestRecordingUrl = null;
    this.playerId = playerId;
    this.filesystem = filesystem;
    this.audioBlob = new Blob();
    this.fileName = "";
  }
  
  async init() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recorder = new MediaRecorder(this.stream);
      
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.recorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.latestRecordingUrl = window.URL.createObjectURL(this.audioBlob);
        this.recordedBuffer = this.createAudioBuffer(this.audioBlob);
        this.audioChunks = [];
        this.isRecording = false;

        // Save the recording to the server
        this.fileName = `recording_${this.playerId}.wav`;
        console.log("Buffer created", this.recordedBuffer);

        //this.saveRecording(this.audioBlob, this.fileName);
        this.createDownloadLink(this.audioBlob, this.fileName);
      };
    } catch (error) {
      console.error('Error initializing the recorder:', error);
    }
  }
  
    start() {
      if (this.recorder && !this.isRecording) {
        this.recorder.start(1000); // Startet einen neuen Chunk alle 1000ms
        this.isRecording = true;
      }
    }

    stop() {
      if (this.recorder && this.isRecording) {
        this.recorder.stop();
      }
    }

    async createAudioBuffer(audioBlob) {
      const arrayBuffer = await audioBlob.arrayBuffer();
      this.recordedBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    }

    getRecordedBuffer() {
      return this.recordedBuffer;
    }

    getLatestRecordingUrl() {
      return this.latestRecordingUrl;
    }

    async saveRecording(audioBlob, fileName) {
      const getlatestDir = this.getLatestRecordingUrl();

      // const formData = new FormData();
      // formData.append('audio', audioBlob, fileName);
      
      console.log('Sending file:', fileName);
      console.log('Blob size:', audioBlob.size);
      console.log('latest Recording Dir', getlatestDir);

      // const apiUrl = "http://localhost:8000/assets";

      // const response = await fetch(apiUrl, {
      //   method: 'POST',
      //   cache: 'no-cache',
      //   body: formData
      // });

      // return response.json();
    }

    createDownloadLink(audioBlob, fileName) {    
      const url = URL.createObjectURL(audioBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.innerHTML = 'Aufnahme herunterladen';
      downloadLink.style.display = 'block';
      downloadLink.style.margin = '20px 0';
      document.body.appendChild(downloadLink);
    }

    // Audioblob abspeichern
    // async saveRecording(audioBlob, fileName) {
    //   const getlatestDir = this.getLatestRecordingUrl();
      
    //   console.log('Sending file:', fileName);
    //   console.log('Blob size:', audioBlob.size);
    //   console.log('latest Recording Dir', getlatestDir);

    //   try {
    //     await this.filesystem.writeFile(fileName, audioBlob);
    //   } catch (error) {
    //     console.error('Error uploading audio:', error);
    //   }
    // }

    // Änderungen: Hinzufügen der saveRecording Funktion
    // async saveRecording(audioBlob, fileName) {
    //   const formData = new FormData();
    //   const getlatestDir = this.getLatestRecordingUrl();
    //   formData.append('audio', audioBlob, fileName);

    //   console.log('Sending file:', fileName);
    //   console.log('Blob size:', audioBlob.size);
    //   console.log('latest Recording Dir', getlatestDir);

    //   try {
    //     axios.post('/save-recording', formData, {'Content-type: multipart/form-data'})
    //     // const response = await fetch('/save-recording', {
    //     //   method: 'POST',
    //     //   body: formData,
    //     let response;
    //     });

    //     console.log('Response status:', response.status);
    //     const responseText = await response.text();
    //     console.log('Response text:', responseText);
    //     if (!response.ok) {
    //       throw new Error(`Error uploading audio: ${response.statusText}`);
    //     }

    //     const data = JSON.parse(responseText);
    //     console.log('Audio uploaded successfully:', data);
    //   } catch (error) {
    //     console.error('Error uploading audio:', error);
    //   }
    // }
}
  
  export default Recorder;