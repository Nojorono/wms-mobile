
export const getRoleForUser = (userId:any, inboundPlan:any) => {
  // Check if user is the checker_leader
  if (inboundPlan.checker_leader.id === userId) {
    return 'checker_leader';
  }

  // Check if user is one of the checkers
  if (inboundPlan.checkers.some((checker:any) => checker.id === userId)) {
    return 'checker';
  }

  return '';
};
