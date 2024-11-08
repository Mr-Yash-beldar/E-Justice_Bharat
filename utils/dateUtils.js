// dateUtils.js

const formatDateToYYYYMMDD = (input) => {
    const date = new Date(input);
    if (isNaN(date)) {
      throw new Error("Invalid date format");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };  
  
  module.exports = { formatDateToYYYYMMDD };
  