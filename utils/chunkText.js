// const chunkText = (text, chunkSize = 1000, overlap = 200) => {
//   const chunks = [];

//   let start = 0;

//   while (start < text.length) {//text is extracted from pdf 
//     const end = start + chunkSize; //0+1000=1000

//     const chunk = text.slice(start, end).trim();

//     if (chunk.length > 0) {
//       chunks.push(chunk);//push to our array 
//     }

//     start += chunkSize - overlap;//calculating next start point with considering the overlap condition as well.
//   }

//   return chunks;
// };

// module.exports = chunkText;

// const chunkText = (pages, chunkSize = 1000, overlap = 200) => {
//   const chunks = [];

//   for (const page of pages) {
//     const text = page.text;

//     let start = 0;

//     while (start < text.length) {
//       const end = start + chunkSize;

//       const chunk = text.slice(start, end).trim();

//       if (chunk.length > 0) {
//         chunks.push({
//           text: chunk,
//           pageNumber: page.num
//         });
//       }

//       start += chunkSize - overlap;
//     }
//   }

//   return chunks;
// };

// module.exports = chunkText;


const chunkText = (pages, chunkSize = 1000, overlap = 200) => {
  const chunks = [];

  for (const page of pages) {
    const text = page.text || "";

    let start = 0;

    while (start < text.length) {
      const end = start + chunkSize;

      const chunk = text.slice(start, end).trim();

      if (chunk.length > 0) {
        chunks.push({
          text: chunk,
          pageNumber: page.num
        });
      }

      start += chunkSize - overlap;
    }
  }

  return chunks;
};

module.exports = chunkText;