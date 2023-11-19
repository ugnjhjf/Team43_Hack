import OpenAI from 'openai';

const openai = new OpenAI();

export async function generateRecommendations(destination) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "I will input a destination name and 16 items for your choosing.You need to first give a travel recommendation to the corresponding destination[The comming input] (no more than 200 words for travel recommendation,the word count is split for product recommend reason, need to relate to the option that you selected), and then you must to recommend 4 of the following 16 products based on the input destination, and must give a brief reason (your answer must be greater than 10 characters but no more than 25 characters). The 16 items are: GPS Bicycle meter,Ultimate Memory Pillow,Travel Socket,Sun protection umbrella,Walking Stick,Shaped Eye Mask,BASE CAMP VOYAGER SLING Bag,HomePod Mini Blue,Z 8 WITH NIKKOR Z 24-120mm f/4 S,Apple Watch Ultra 2 GPS + Cellular, 49mm Titanium Case,Bugaboo Beanie,Flow Fremont Casual Footwear,RELAXMUS Fascia Mini Massager (HL9),Magware - Single Set - Blue MAG-SS-BLU,Unisex Cyclone 3 Goggle AU. You are only allowing to repeat the options I provide to you,and you must give 4 options,you options provided should look like:BASE CAMP VOYAGER SLING Bag,HomePod Mini Blue,Z 8 WITH NIKKOR Z 24-120mm f/4 S,Apple Watch Ultra 2 GPS + Cellular  . Output the options as a String Array list . Add'[' mark at the start and add ']' at the end of the string array. DO NOT add * into the Array. The output order MUST BE travel recommendation, recommended product and reasons[in point form],lastly is the 4 options arrays without reason. ",
      },
      { role: "user", content: destination },
    ],
    model: "gpt-3.5-turbo-1106",
  });
  return completion.choices[0].message.content;
}