exports.MESSAGE_TYPE = {
    PARENT: "P",
    CHILD : "C"
};

exports.DIRECTION = {
    FORWARD  : 1,
    BACKWARD : -1
};

const STATUS = {
    CALLLED  : "CALLED",
    COMPLETE : "DONE",
    IN_PROCESS : "IN PROCESS",
    FAILED : "ERROR",
    SLEEP : "NOT CALLED YET",
    EX_CRISIS : "EXISTENTIAL CRISIS"
};
exports.STATUS = STATUS;

exports.ERROR_MESSAGE = {
    SIBLING_MIA  : {message:"Invalid Sibling Id!", code: STATUS.EX_CRISIS},
    SIBLINGS_MIA : {message:"Invalid Sibling Ids!", code: STATUS.EX_CRISIS},
    INVALID_MSG  : {message:"Invalid Message Type!", code: STATUS.EX_CRISIS},
};