import AIConversation from "../models/AIConversation.js";


// ============================================================
// PYTHON AI COUNSELING SERVICE
// ============================================================

const PYTHON_AI_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:5001";


// ============================================================
// GET AI CONVERSATION
// ============================================================

export const getAIConversation = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const conversation =
      await AIConversation.findOne({
        user: userId,
      });

    // --------------------------------------------------------
    // No conversation yet
    // --------------------------------------------------------

    if (!conversation) {
      return res.status(200).json({
        success: true,
        conversation: {
          user: userId,
          messages: [],
          memorySummary: "",
          lastTopic: "",
        },
      });
    }

    // --------------------------------------------------------
    // Return existing conversation
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      conversation: {
        _id: conversation._id,
        user: conversation.user,
        messages: conversation.messages,
        memorySummary:
          conversation.memorySummary || "",
        lastTopic:
          conversation.lastTopic || "",
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "GET AI CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load AI conversation.",
    });
  }
};


// ============================================================
// SEND AI MESSAGE
// ============================================================

export const sendAIMessage = async (
  req,
  res
) => {
  try {
    const {
      userId,
      message,
    } = req.body;


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }


    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }


    const cleanMessage =
      message.trim();


    // ========================================================
    // FIND EXISTING CONVERSATION
    // ========================================================

    let conversation =
      await AIConversation.findOne({
        user: userId,
      });


    // ========================================================
    // CREATE IF IT DOES NOT EXIST
    // ========================================================

    if (!conversation) {
      conversation =
        new AIConversation({
          user: userId,
          messages: [],
          memorySummary: "",
          lastTopic: "",
        });
    }


    // ========================================================
    // GET PREVIOUS CONVERSATION
    // ========================================================
    //
    // We only send recent messages to the AI service.
    // The complete conversation remains safely stored
    // in MongoDB.
    //
    // ========================================================

    const recentMessages =
      conversation.messages
        .slice(-12)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));


    // ========================================================
    // PREPARE PYTHON REQUEST
    // ========================================================

    const pythonRequest = {
      userId: userId,

      message: cleanMessage,

      conversationHistory:
        recentMessages,

      memorySummary:
        conversation.memorySummary || "",

      lastTopic:
        conversation.lastTopic || "",
    };


    console.log(
      "Sending message to Python AI Counselor..."
    );


    // ========================================================
    // CALL PYTHON AI SERVICE
    // ========================================================

    let pythonResponse;

    try {
      pythonResponse =
        await fetch(
          `${PYTHON_AI_URL}/api/ai-counseling/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              pythonRequest
            ),
          }
        );
    } catch (pythonConnectionError) {
      console.error(
        "PYTHON AI SERVICE CONNECTION ERROR:",
        pythonConnectionError
      );

      return res.status(503).json({
        success: false,
        message:
          "AI counseling service is unavailable. Please make sure the Python AI service is running.",
      });
    }


    // ========================================================
    // READ PYTHON RESPONSE
    // ========================================================

    let pythonData;

    try {
      pythonData =
        await pythonResponse.json();
    } catch (jsonError) {
      console.error(
        "PYTHON RESPONSE JSON ERROR:",
        jsonError
      );

      return res.status(500).json({
        success: false,
        message:
          "Invalid response received from AI counseling service.",
      });
    }


    // ========================================================
    // CHECK PYTHON RESPONSE
    // ========================================================

    if (
      !pythonResponse.ok ||
      !pythonData.success
    ) {
      console.error(
        "PYTHON AI SERVICE ERROR:",
        pythonData
      );

      return res.status(500).json({
        success: false,
        message:
          pythonData.message ||
          "AI counselor failed to generate a response.",
      });
    }


    // ========================================================
    // GET GENERATED AI RESPONSE
    // ========================================================

    const aiResponse =
      typeof pythonData.response === "string"
        ? pythonData.response.trim()
        : "";


    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message:
          "AI counselor returned an empty response.",
      });
    }


    // ========================================================
    // SAVE USER MESSAGE
    // ========================================================

    conversation.messages.push({
      role: "user",
      content: cleanMessage,
    });


    // ========================================================
    // SAVE AI COUNSELOR RESPONSE
    // ========================================================

    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
    });


    // ========================================================
    // UPDATE LAST TOPIC
    // ========================================================
    //
    // Keep this short because the field is intended to store
    // the current conversation topic.
    //
    // ========================================================

    conversation.lastTopic =
      cleanMessage.substring(
        0,
        120
      );


    // ========================================================
    // SAVE CONVERSATION
    // ========================================================

    await conversation.save();


    // ========================================================
    // RETURN ONLY THE AI COUNSELOR RESPONSE
    // ========================================================
    //
    // RAG references are NOT returned here.
    //
    // ========================================================

    return res.status(200).json({
      success: true,

      response: aiResponse,

      message: aiResponse,

      conversationId:
        conversation._id,
    });
  } catch (error) {
    console.error(
      "SEND AI MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process AI counseling message.",
    });
  }
};


// ============================================================
// CLEAR AI CONVERSATION
// ============================================================

export const clearAIConversation = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;


    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }


    const conversation =
      await AIConversation.findOne({
        user: userId,
      });


    // --------------------------------------------------------
    // Nothing to clear
    // --------------------------------------------------------

    if (!conversation) {
      return res.status(200).json({
        success: true,
        message:
          "AI conversation is already empty.",
      });
    }


    // --------------------------------------------------------
    // Clear messages
    // --------------------------------------------------------

    conversation.messages = [];


    // --------------------------------------------------------
    // Clear long-term memory
    // --------------------------------------------------------

    conversation.memorySummary = "";


    // --------------------------------------------------------
    // Clear topic
    // --------------------------------------------------------

    conversation.lastTopic = "";


    // --------------------------------------------------------
    // Save
    // --------------------------------------------------------

    await conversation.save();


    return res.status(200).json({
      success: true,
      message:
        "AI conversation cleared successfully.",
    });
  } catch (error) {
    console.error(
      "CLEAR AI CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to clear AI conversation.",
    });
  }
};