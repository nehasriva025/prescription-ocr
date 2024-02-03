import { useState, useRef } from 'react';
import preprocessImage from './preProcessingImage';
import { FaImage } from "react-icons/fa"; 
import Tesseract from 'tesseract.js';
import './App.css';

function AddPrescription(){

    const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
  // Key and endpoint can be found after creating a Language Resource in Azure 
  const key = 'ENTER KEY HERE';
  const endpoint = 'ENTER ENDPOINT HERE';

  // Authenticate the client with your key and endpoint
  const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));

  const [ocr, setOcr] = useState("");
  const [ocrComplete, completeOCR] = useState(false); 
  const [nlpComplete, completeNLP] = useState(false); 
  const [nlpStarted, startingNLP] = useState(false);
  const [drugName, setDrugName] = useState("");
  const [medForm, setMedForm] = useState("");
  const [medRoute, setMedRoute] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFreq] = useState("");
  const [duration, setDuration] = useState("");
  const [imageData, setImage] = useState("");
  const [imageLoaded, setLoaded] = useState(false); 
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInput = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [progress, setProgress] = useState(0);



  var img = document.createElement('img');
  img.src = imageData;
  img.onload = function () {
    setWidth(img.width);
    setHeight(img.height);
  }

  // File Upload Event Handlers 
  const handleFileUploadClick = (event) => {
    fileInput.current.click(); 
  }

  const handleChange = (event) => {
    setLoaded(false); 
    completeOCR(false); 
    if (!event.target.files[0]) return; 
    // Sets imagedata to the uploaded image
    setImage(URL.createObjectURL(event.target.files[0]))
  }


  // Starts the OCR process by extracting text from the uploaded image 
  // Function is called when "Confirm Image" is pressed 
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Preprocesses the Image before passing it to the Tesseract text recognizer 
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.putImageData(preprocessImage(canvas), 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    Tesseract.recognize(
      dataUrl, 'eng',
      {
        logger: m => setProgress(parseInt(m.progress * 100))

      }
    )
      .catch(err => {
        console.error(err);
      })
      .then(({ data: { text } }) => {
        // Storing the extracted text once the recognizer is finished processing 
        setOcr(text);
        console.log(text); 
        // Toggling button visibility
        setLoaded(false); 
        completeOCR(true); 
        console.log("done!!"); 
      });
  }

  async function healthExample(ocrText, client) {
    console.log("== Recognize Healthcare Entities Sample ==");

    // const documents = [
    //     "Prescribed 100mg ibuprofen, taken twice daily. Take 3 100mg Advil tablets by mouth once a day for 3 days"
    // ];
    const documents = [ ocrText ]; 
    const poller = await client.beginAnalyzeHealthcareEntities(documents, "en", {
        includeStatistics: true
    });

    poller.onProgress(() => {
        console.log(
            `Last time the operation was updated was on: ${poller.getOperationState().lastModifiedOn}`
        );
    });
    console.log(
        `The analyze healthcare entities operation was created on ${poller.getOperationState().createdOn
        }`
    );
    console.log(
        `The analyze healthcare entities operation results will expire on ${poller.getOperationState().expiresOn
        }`
    );

    // The Microsoft Analyzer function has extracted the medical entities in the ocr text
    const results = await poller.pollUntilDone();
    var resultString = '', medName = '', medForm = '', medRoute = '', duration = '', frequency = '', dosage = ''; 

    for await (const result of results) {
        console.log(`- Document ${result.id}`);
        if (!result.error) {
            console.log("\tRecognized Entities:");

            for (const entity of result.entities) {
                console.log(`- Entity "${entity.text}" of type ${entity.category}`);
                // If the medical entity's category is part of the desired perscription data, the entity will be added 
                if (entity.category == "MedicationName") {
                    medName += entity.text + " "; 
                    console.log("medname", medName);
                } else if (entity.category == "MedicationRoute") {
                    medRoute += entity.text + " "; 
                } else if (entity.category == "Frequency") {
                    frequency += entity.text + " "; 
                } else if (entity.category == "Dosage") {
                    dosage += entity.text + " "; 
                } else if (entity.category == "MedicationForm") {
                    medForm += entity.text + " "; 
                } else if (entity.category == "Time") {
                    duration += entity.text + " "; 
                }
                resultString += `- Entity "${entity.text}" of type ${entity.category} \n`; 
            }
        } else console.error("\tError:", result.error);
    }
    // Returning prescription data
    console.log(medName, medForm, medRoute, dosage, frequency, duration); 
    return [medName, medForm, medRoute, dosage, frequency, duration]; 

}

  // Function is called when the uploaded image 
  // is loaded and displayed
  const loaded = (e) => {
    console.log("Image Loaded"); 
    // Toggles button visibility 
    setLoaded(true);   
    completeNLP(false); 
  } 

  // Starts analyzing text for medication entities. 
  // This is called once the "Get Prescription" button is pressed 
  const startNlp = (e) => {
    // Toggling Button visibility 
    completeOCR(false); 
    startingNLP(true); 
    console.log("analyzing text"); 
    // Calling the Microsoft Analyzing function 
    healthExample(ocr, textAnalyticsClient).catch((err) => {
      console.error("The sample encountered an error:", err);
  }).then((resStr) => {
    console.log("analysis complete");
    // Once the Microsoft function is completed, set the medication data with the results of the function 
    resStr[0]? setDrugName(resStr[0]) : setDuration("Review with Label, Pharmacy, or Doctor");  
    resStr[1]? setMedForm(resStr[1]) : setMedForm("Review with Label, Pharmacy, or Doctor");
    resStr[2]? setMedRoute(resStr[2]) : setMedRoute("Review with Label, Pharmacy, or Doctor");
    resStr[3]? setDosage(resStr[3]) : setDosage("Review with Label, Pharmacy, or Doctor");
    resStr[4]? setFreq(resStr[4]): setFreq("Review with Label, Pharmacy, or Doctor");
    resStr[5]? setDuration(resStr[5]) : setDuration("Review with Label, Pharmacy, or Doctor");

    startingNLP(false); 
    completeNLP(true); 
    console.log("assignment complete"); 
  }
      
  );
  }


  return (
    <div>
          {progress < 100 && progress > 0 && <div>
        <div className="progress-label">Progress ({progress}%)</div>
        <div className="progress-bar">
          <div className="progress" style={{width: `${progress}%`}} ></div>
        </div>
      </div>}
        <div>
          <div className="chooseImage">
            {/*Button to toggle file input */}
          <button 
          onClick={handleFileUploadClick}
          >
            Upload File
          </button>
          { /* File input is used to upload image */}
          <input
          type="file"
          name=""
          id=""
          ref = {fileInput}
          onChange={handleChange}
          accept="image/*"
          style={{display: 'none'}}
        />
          </div>
         
        </div>

      <div className="displayResults">
      {/* Display Image that was uploaded */}
      {imageData ?
      <img src={imageData} alt="" srcSet="" className="userImage" ref = {imageRef} 
      onLoad = {loaded}
       /> 
      
      : 
      <FaImage size={35} className="defaultImg"></FaImage>
      }
        <canvas ref={canvasRef} width={width} height={height}></canvas>

      {/*Once Image is loaded, user must confirm they uploaded the correct image. 
          Once confirmation button is pressed, ocr process starts */}
        {imageLoaded? 
        <button 
          onClick={handleClick}
          >
            Confirm Image
          </button> 
          : ""}

      {/*Once OCR is completed, user can get their prescription. Once button
          is pressed, NLP (Microsoft Analyzer) process starts */}
      {ocrComplete ? 
       <button 
       onClick={startNlp}
       >
        Get Prescription
       </button> 
       : ""}
      
      {nlpStarted ? <h3>Loading...</h3> : ""}

      {/*Once NLP is completed, results are displayed */}
      {nlpComplete ? <h3>New Prescription</h3> : ""}

      {nlpComplete ?<p> <span style={{ 'color': "#00B4D8", "fontWeight":"bold"}} >Medication Name: </span>{drugName}</p>: ''}
      {nlpComplete ?<p> <span style={{ 'color': "#00B4D8", "fontWeight":"bold"}} >Form: </span>{medForm}</p>: ''}
      {nlpComplete ?<p> <span style={{ 'color': "#00B4D8", "fontWeight":"bold"}} >Route: </span>{medRoute}</p>: ''}
      {nlpComplete ?<p> <span style={{ 'color': "#00B4D8", "fontWeight":"bold"}} >Dosage: </span>{dosage}</p>: ''}
      {nlpComplete ?<p> <span style={{ 'color': "#00B4D8", "fontWeight":"bold"}} >Frequency: </span>{frequency}</p>: ''}
      {nlpComplete ?<p> <span style={{ 'color': "#00B4D8", "fontWeight":"bold"}} >Duration: </span>{duration}</p>: ''}






    </div>

    </div>

  );



}
export default AddPrescription; 