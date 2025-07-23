import History from "../models/historyModel.js";

const getHistory = async (req, res) => {
  try {
    const allHistory = await History.find();

    if (!allHistory) {
      return res
        .status(404)
        .json({ message: "Not any history found", success: false });
    }
    return res
      .status(200)
      .json({
        message: "got history succesfully",
        success: true,
        history: allHistory,
      });
  } catch (err) {
    console.error("Error in getting history:", err);
    return res.status(500).json({ message: err, success: false });
  }
};

export default getHistory;
