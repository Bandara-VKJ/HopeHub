import Diary from '../models/Diary.js';

export const addDiary = async (req, res)=>{
    try {
        const  {userId, date, mood, content} = req.body 

        if(!userId)
        {
            return res.status(400).json({
            message: "User ID was not identified"
            });
        }
        if(!date || !mood  || !content)
        {
            return res.status(400).json({
                 message: "Please fill & select all fields"
            })
        }

        const diary = new Diary({
            userId,
            date,
            mood,
            content
        })

        const saveDiary = await diary.save();

         return res.status(201).json({
            message: "Diary saved successfully",
        });

    } catch (error) {
        console.log("error:", error);
        res.status(500).json({
        message: "user diary fail to save",
        });
    }
}


