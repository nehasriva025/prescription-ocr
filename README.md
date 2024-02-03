# Prescription OCR App

Users can upload pictures of their prescriptions so that information on medication name, form, route of administration, dosage, and frequency can be stored. This information can be used for records, medication reminders, or to help answer questions about the patient's medication. 

## Instructions

This app uses Tessaract OCR for text extraction and Microsoft Azure Text Analytics for Health for the medical entity understanding. 

For Tessaract OCR run: 

`npm install tesseract.js`

For Microsoft Azure run: 

`npm install @azure/ai-text-analytics`

To run the app: 

`npm start`

## Future Considerations 
Looking into improving image preproccesing or using a different OCR engine may help to improve results. Currently, this works best if the user uploads a picture of their prescription on a flat surface (doesn't account for bottles, etc)

