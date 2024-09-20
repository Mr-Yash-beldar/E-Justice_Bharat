const cv = require('opencv4nodejs');
const tesseract = require('tesseract.js');

// Function to preprocess the image using OpenCV
const preprocessImage = (imagePath) => {
  const image = cv.imread(imagePath);

  // Convert the image to grayscale
  const grayImage = image.bgrToGray();

  // Apply Gaussian blur to smooth the image
  const blurredImage = grayImage.gaussianBlur(new cv.Size(5, 5), 0);

  // Apply thresholding to make text stand out
  const thresholdImage = blurredImage.threshold(150, 255, cv.THRESH_BINARY_INV);

  // Save the preprocessed image (optional)
  cv.imwrite('preprocessed.png', thresholdImage);

  return 'preprocessed.png'; // Return the path of the preprocessed image
};

// Function to extract text using Tesseract.js
const extractText = async (imagePath) => {
  const preprocessedImage = preprocessImage(imagePath);

  const { data: { text } } = await tesseract.recognize(preprocessedImage, 'eng+hin', {
    logger: m => console.log(m), // Log OCR progress (optional)
  });

  return text.toUpperCase(); // Return the extracted text in uppercase
};

// Aadhaar validation function
const checkIfAadhaar = async (imagePath) => {
  try {
    const extractedText = await extractText(imagePath);

    // Aadhaar number pattern (4444 4444 4444)
    const aadhaarPattern = /\b\d{4}\s\d{4}\s\d{4}\b/;

    // Date of Birth pattern (DD/MM/YYYY)
    const dobPattern = /\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/;

    // Aadhaar Slogan (in various languages)
    const slogans = [
      'MERA AADHAAR MERI PEHCHAAN', 'मेरा आधार मेरी पहचान', 
      'મારો આધાર મારી ઓળખ', 'என் ஆதார் என் அடையாளம்', 
      'আমার আধার আমার পরিচয়'
    ];

    // Check for Aadhaar number
    const aadhaarNumberMatch = aadhaarPattern.exec(extractedText);
    const isAadhaarNumberPresent = aadhaarNumberMatch ? true : false;

    // Check for Date of Birth
    const dobMatch = dobPattern.exec(extractedText);
    const isDOBPresent = dobMatch ? true : false;

    // Check for Aadhaar slogan
    const isSloganPresent = slogans.some(slogan => extractedText.includes(slogan));

    if (isAadhaarNumberPresent && isSloganPresent && isDOBPresent) {
      return {
        isValid: true,
        message: 'Aadhaar document is valid.',
        aadhaarNumber: aadhaarNumberMatch[0].trim(),
        dob: dobMatch[0].trim(),
      };
    } else {
      return {
        isValid: false,
        message: 'Aadhaar document is not valid. Missing necessary information.',
        errors: {
          aadhaarNumber: isAadhaarNumberPresent ? null : 'Aadhaar number missing',
          dob: isDOBPresent ? null : 'Date of birth missing',
          slogan: isSloganPresent ? null : 'Aadhaar slogan missing',
        },
      };
    }
  } catch (error) {
    console.error('Error in Aadhaar validation:', error);
    return {
      isValid: false,
      message: 'Error occurred during Aadhaar validation.',
    };
  }
};

// Usage example
const imagePath = 'path_to_your_aadhaar_image.png';
checkIfAadhaar(imagePath).then(result => {
  console.log(result);
});
