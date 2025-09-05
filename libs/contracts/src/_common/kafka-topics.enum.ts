export enum KafkaTopics {
  OrderTransitions = 'order_transitions',
  StageTransitions = 'stage_transitions',
  CancelRequest = 'cancel_request',
  StageConfirmationRequest = 'stage_confirmation_request',
  AllResponsesReceived = 'all_responses_received',
  InvitationDeclined = 'invitation_declined',
  RequestEdited = 'request_edited',
  VipStatusUpdates = 'vip_status_updates',
  GradeUpdates = 'grade_updates',
  AllInvitationsDeclined = 'all_invitations_declined',
}
