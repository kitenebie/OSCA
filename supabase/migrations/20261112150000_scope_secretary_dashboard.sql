UPDATE public.roles
SET action_permissions = COALESCE(action_permissions, '{}'::jsonb) || jsonb_build_object(
      'canViewOnlyAssignedBrgy', true
    )
WHERE role IN ('secretary-(admin)', 'bhw-(encoder)');
