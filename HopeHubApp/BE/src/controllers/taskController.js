import Task from '../models/Task.js'

export const createWeeklyTasks = async (req, res) => {
    try {
            const { userId, counselorId, days } = req.body;

    if(!counselorId)
        {
            return res.status(401).json({ error: "counselor Id is required" });
        }    
    if (!userId || !Array.isArray(days) || days.length === 0) 
        {
        return res.status(400).json({ error: "userId, days[] are required" });
        }

    const docsToInsert = [];

        for(const day of days)
        {
            if(!day.date ||!Array.isArray(day.tasks)) continue;
            for(const task of day.tasks)
                {
                    if(!task.title) continue;
                    
                    docsToInsert.push({
                        userId,
                        counselorId,
                        title: task.title,
                        description: task.description || "",
                        date : day.date,
                        status: "pending",
                        family_status: "pending_confirmation",
                    });

                }   
        }
            if (docsToInsert.length === 0) {
                return res.status(400).json({ error: "No valid tasks to create" });
            }

           const created = await Task.insertMany(docsToInsert);
            res.status(201).json({ tasks: created });

    } catch (error) {
        res.status(500).json({ error: "Failed to create weekly tasks" });
    }
}

export const getTasks = async (req, res) => {
    try {
       const { userId, counselorId } = req.query;
       
        if(!userId || !counselorId)
        {
            return res.status(401).json({ error: "userId and counselorId are required" });
        }
        const response = await Task.find({userId,counselorId});

        res.status(200).json({success: true, response})
    } catch (error) {
        res.status(500).json({ error: "Failed to get tasks" });
    }
}

export const getTasksById = async (req, res) => {
    try {
       const { userId } = req.query;

        if(!userId)
        {
            return res.status(401).json({ error: "userId is required" });
        }

        const today = new Date().toISOString().split("T")[0];
       
        const tasks = await Task.find({userId, date:today}, "title description status date family_status");

        res.status(200).json({success: true, tasks})
    } catch (error) {
        res.status(500).json({ error: "Failed to get tasks" });
    }
}


export const updateFamilyStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { family_status } = req.body;

        if (!taskId) {
            return res.status(400).json({ error: "taskId is required" });
        }

        const allowedStatuses = ["confirmed", "rejected"];

        if (!allowedStatuses.includes(family_status)) {
            return res.status(400).json({ error: "family_status must be 'confirmed' or 'rejected'" });
        }

          const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        

        if (task.family_status !== "pending_confirmation") {
            return res.status(400).json({
                error: `Task is not pending confirmation (current family_status: ${task.family_status})`
            });
        }

        task.family_status = family_status; 

        await task.save();

         res.status(200).json({ success: true, task });

    } catch (error) {
        console.error("Update family status error:", error);
        res.status(500).json({ error: "Failed to update family status" });
    }
}
export const updatePatientStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (!taskId) {
            return res.status(400).json({ error: "taskId is required" });
        }

        const allowedStatuses = ["completed", "pending"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "status must be 'completed' or 'pending'" });
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        task.status = status;

        if (status === "completed") {
            task.completedAt = new Date();
            task.family_status = "pending_confirmation";
        }

        await task.save();

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
}