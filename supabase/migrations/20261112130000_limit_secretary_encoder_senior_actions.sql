UPDATE public.roles
SET can_delete_senior = false,
    action_permissions = COALESCE(action_permissions, '{}'::jsonb) || jsonb_build_object(
      'canViewTableList', true,
      'canEditRecord', true,
      'canViewProfile', true,
      'canViewIDCard', true,
      'canUpdateStatus', false,
      'canArchive', false
    )
WHERE role IN ('secretary-(admin)', 'bhw-(encoder)');
