UPDATE public.roles
SET action_permissions = COALESCE(action_permissions, '{}'::jsonb) || jsonb_build_object(
      'canViewOnlyAssignedBrgy', role = 'bhw-(encoder)'
    )
WHERE role IN ('secretary-(admin)', 'bhw-(encoder)');
