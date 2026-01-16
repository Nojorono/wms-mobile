
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

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
