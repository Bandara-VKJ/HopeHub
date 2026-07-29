import Task from '../models/Task.js'

export const createWeeklyTasks = async (req, res) => {
    try {
            const { userId, tasks, startDate } = req.body;

            if (!userId || !Array.isArray(tasks) || tasks.length === 0 || !startDate) {
      return res.status(400).json({ error: "userId, tasks[], and startDate are required" });
    }

    const start = new Date(startDate);

    if(isNaN(start.getTime()))
    {
        return res.status(400).json({ error: "Invalid startDate" });
    }

    const docsToInsert = [];

        for(const task of tasks)
        {
            const taskDate = new Date(start)
            if(!task.title) continue;

            const offset = typeof task.dayOffset === 'number' ? task.dayOffset : 0;
            taskDate.setDate(taskDate.getDate() + offset);
            taskDate.setHours(0, 0, 0, 0);
            
            docsToInsert.push({
                userId,
                title: task.title,
                description: task.description || "",
                date : taskDate,
                status: "pending",
            });

    }
           const created = await Task.insertMany(docsToInsert);
            res.status(201).json({ tasks: created });

    } catch (error) {
        console.error("Create weekly tasks error:", error);
        res.status(500).json({ error: "Failed to create weekly tasks" });
    }
}