import { AssignmentModel, IAssignment, IAssignmentModel } from '../models';
import { convertStaffToResponseObject as convertStaff, convertTableToResponseObject as convertTable } from '.';
import { paginate } from '../shared';

function convertToResponseObject(assignment) {
    return {
        id: assignment.id,
        staff: convertStaff(assignment.staffId),
        table: convertTable(assignment.tableId)
    };
}

function getOriginAssignment(assignmentId: string): Promise<any> {
    return AssignmentModel.findOne({ _id: assignmentId })
        .then((responsedAssignment) => {
            if (responsedAssignment) {
                return Promise.resolve(responsedAssignment);
            } else {
                return Promise.reject({
                    statusCode: 400,
                    message: 'Assignment not found.'
                });
            }
        })
        .catch((error) => {
            if (!error.statusCode) {
                return Promise.reject({
                    statusCode: 500,
                    message: 'Internal server error.'
                });
            } else {
                return Promise.reject(error);
            }
        });
}

function getAssignmentById(assignmentId: string): Promise<any> {
    return AssignmentModel.findOne({ _id: assignmentId })
        .then((responsedAssignment) => {
            if (responsedAssignment) {
                return responsedAssignment.populate('staffId').populate('tableId').execPopulate()
                    .then((populatedAssignment) => {
                        return Promise.resolve(convertToResponseObject(populatedAssignment));
                    })
                    .catch((error) => {
                        return Promise.reject({
                            statusCode: 500,
                            message: 'Internal server error.'
                        });
                    });
            } else {
                return Promise.reject({
                    statusCode: 400,
                    message: 'Assignment not found.'
                });
            }
        })
        .catch((error) => {
            if (!error.statusCode) {
                return Promise.reject({
                    statusCode: 500,
                    message: 'Internal server error.'
                });
            } else {
                return Promise.reject(error);
            }
        });
}

function getAssignmentListByStaffId(staffId: string): Promise<any> {
    return AssignmentModel.find({ staffId: staffId })
        .populate('staffId').populate('tableId')
        .then(
        assignments => {
            const data = [];
            for (const i in assignments) {
                if (assignments[i]) {
                    data[i] = convertToResponseObject(assignments[i]);
                }
            }
            return Promise.resolve(data);
        }
        )
        .catch(
        error => {
            return Promise.reject({
                statusCode: 500,
                message: 'Internal server error.'
            });
        }
        );
}

function getAssignmentActiveListByStaffId(staffId: string): Promise<any> {
    console.log(staffId);
    return AssignmentModel.find({ staffId: staffId })
        .populate('staffId').populate('tableId')
        .then(
        assignments => {
            console.log(assignments);
            const data = [];
            for (let i = 0; i < assignments.length; i++) {
                if (assignments[i]) {
                    data[i] = convertToResponseObject(assignments[i]);
                    if (data[i].table.active === false) {
                        assignments.splice(i, 1);
                        data.splice(i, 1);
                        i--;
                    }
                }
            }
            return Promise.resolve(data);
        }
        )
        .catch(
        error => {
            return Promise.reject({
                statusCode: 500,
                message: 'Internal server error.'
            });
        }
        );
}

function getAssignmentListByTableId(tableId: string): Promise<any> {
    return AssignmentModel.find({ tableId: tableId })
        .populate('staffId').populate('tableId')
        .then(
        assignments => {
            const data = [];
            for (const i in assignments) {
                if (assignments[i]) {
                    data[i] = convertToResponseObject(assignments[i]);
                }
            }
            return Promise.resolve(data);
        }
        )
        .catch(
        error => {
            return Promise.reject({
                statusCode: 500,
                message: 'Internal server error.'
            });
        }
        );
}

function insertAssignment(assignment: IAssignment): Promise<any> {
    const newAssignment = new AssignmentModel(assignment);
    return newAssignment.save()
        .then(
        (responsedAssignment) => {
            return responsedAssignment.populate('staffId').populate('tableId').execPopulate()
                .then(
                (populatedAssignment) => {
                    return Promise.resolve(convertToResponseObject(populatedAssignment));
                }
                )
                .catch(
                (error) => {
                    return Promise.reject({
                        statusCode: 500,
                        message: 'Internal server error.'
                    });
                }
                );
        })
        .catch(
        (error) => {
            console.log(error);
            return Promise.reject({
                statusCode: 500,
                message: 'Internal server error.'
            });
        });
}

function updateAssignment(assignment: IAssignment): Promise<any> {
    return AssignmentModel.findOne({ _id: assignment.id })
        .then(
        (responsedAssignment) => {
            responsedAssignment.staffId = assignment.staffId;
            responsedAssignment.tableId = assignment.tableId;
            return responsedAssignment.save()
                .then(
                updatedAssignment => {
                    return updatedAssignment.populate('staffId').populate('tableId').execPopulate()
                        .then(
                        (populatedAssignment: IAssignment) => {
                            return Promise.resolve(convertToResponseObject(populatedAssignment));
                        }
                        )
                        .catch(
                        error => {
                            return Promise.reject({
                                statusCode: 500,
                                message: 'Internal server error.'
                            });
                        }
                        );
                }
                )
                .catch(
                error => {
                    return Promise.reject({
                        statusCode: 500,
                        message: 'Internal server error.'
                    });
                }
                );
        }
        )
        .catch(
        error => {
            return Promise.reject({
                statusCode: 500,
                message: 'Internal server error.'
            });
        }
        );
}

function deleteAssignment(assignmentId: string): Promise<any> {
    return AssignmentModel.findOneAndRemove({ _id: assignmentId })
        .then(
        () => {
            return Promise.resolve({});
        }
        )
        .catch(
        () => {
            return Promise.reject({
                statusCode: 500,
                message: 'Internal server error.'
            });
        }
        );
}

export const assignmentDao = {
    insertAssignment: insertAssignment,
    getAssignmentById: getAssignmentById,
    getAssignmentListByStaffId: getAssignmentListByStaffId,
    getAssignmentActiveListByStaffId: getAssignmentActiveListByStaffId,
    getAssignmentListByTableId: getAssignmentListByTableId,
    updateAssignment: updateAssignment,
    deleteAssignment: deleteAssignment,
    getOriginAssignment: getOriginAssignment
};
