export interface DocumentationSection {
  heading: string;
  body: string;
  points?: string[];
  example?: string;
}

export interface DocumentationWorkflow {
  heading: string;
  steps: string[];
}

export interface DocumentationArticle {
  id: string;
  title: string;
  subtitle: string;
  overview: string;
  highlights: string[];
  sections: DocumentationSection[];
  workflow?: DocumentationWorkflow;
  bestPractices: string[];
}

export const documentationContent: DocumentationArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    subtitle: 'Onboard your company, fleet, and first operations in one flow.',
    overview:
      'Use this guide when launching FleetFlow for the first time. It covers company setup, core master data, and how to run your first production-safe trip with complete traceability.',
    highlights: ['Account and company bootstrap', 'Vehicle and driver master setup', 'First trip lifecycle'],
    sections: [
      {
        heading: 'Company Setup',
        body:
          'Register the manager account using your official company email and complete organization metadata so all future operations are scoped correctly.',
        points: [
          'Capture legal company name and registration number.',
          'Use an audited business email for account recovery and notifications.',
          'Store operational contact details for dispatch and compliance communication.',
        ],
      },
      {
        heading: 'Fleet and Driver Baseline',
        body:
          'Populate vehicles and drivers before dispatching work. This ensures assignment checks, compliance checks, and alerting logic can run correctly.',
        points: [
          'Vehicle records must include capacity, status, and core documents.',
          'Driver profiles must include role, license metadata, and availability status.',
          'Driver licenses should always have future expiry dates.',
        ],
        example:
          'Example: Register vehicle MH-02-AB-1234 and driver Rajesh Kumar with valid HMV license, then assign to first trip template.',
      },
      {
        heading: 'First Trip Execution',
        body:
          'Create a trip with route, cargo, and revenue data, then assign resources and monitor state transitions from creation to completion.',
        points: [
          'Validate start and destination points before dispatch.',
          'Confirm assigned driver and vehicle are in assignable states.',
          'Close trip with final distance and expense recording for analytics.',
        ],
      },
    ],
    workflow: {
      heading: 'Recommended Day-1 Workflow',
      steps: [
        'Create manager account and company profile.',
        'Add at least one vehicle and one driver.',
        'Create and dispatch one controlled trip.',
        'Verify dashboard metrics and generated expense records.',
      ],
    },
    bestPractices: [
      'Use production email credentials early so setup and reset flows are validated during onboarding.',
      'Avoid placeholder vehicle registration numbers in real environments.',
      'Review role permissions before inviting additional employees.',
    ],
  },
  {
    id: 'fleet-management',
    title: 'Fleet Management',
    subtitle: 'Control vehicle lifecycle, utilization, and readiness at scale.',
    overview:
      'Fleet management is centered on accurate vehicle records and status transitions. Every trip, service action, and compliance decision depends on vehicle state integrity.',
    highlights: ['Vehicle lifecycle states', 'Document and odometer tracking', 'Assignment safety checks'],
    sections: [
      {
        heading: 'Vehicle Status Lifecycle',
        body:
          'Vehicles should move through explicit states such as available, assigned, on-trip, in-shop, and retired so dispatch decisions remain deterministic.',
        points: [
          'Use available for assignment-ready units only.',
          'Set in-shop during preventive or corrective maintenance windows.',
          'Retire vehicles rather than deleting historical records.',
        ],
      },
      {
        heading: 'Compliance and Documentation',
        body:
          'Track registration, insurance, and inspection validity dates with reminders before expiry to prevent unplanned downtime and legal risk.',
        points: [
          'Store renewal windows and responsible owner per vehicle.',
          'Do not dispatch vehicles with expired legal documents.',
          'Maintain history for audits and insurer claims.',
        ],
      },
      {
        heading: 'Maintenance Readiness',
        body:
          'Vehicle reliability depends on odometer-based service planning and fast issue capture from drivers and fleet supervisors.',
        points: [
          'Record current odometer after each completed trip.',
          'Link maintenance logs to specific vehicles and service dates.',
          'Use maintenance data to improve replacement and budgeting plans.',
        ],
      },
    ],
    bestPractices: [
      'Never bypass status checks during urgent dispatching.',
      'Keep service history complete and searchable per vehicle.',
      'Track downtime percentage per unit to identify high-cost assets.',
    ],
  },
  {
    id: 'driver-management',
    title: 'Driver Management',
    subtitle: 'Maintain compliant driver records with clear duty-state transitions.',
    overview:
      'Driver management combines profile accuracy, license compliance, duty-state tracking, and performance monitoring so dispatch and safety decisions can be made with confidence.',
    highlights: ['License and certificate control', 'Duty status transitions', 'Performance and safety indicators'],
    sections: [
      {
        heading: 'Driver Profile Model',
        body:
          'Each driver should have personal identity data, employment context, and licensing metadata tied to the user profile and driver record.',
        points: [
          'Use unique license numbers and keep expiry dates current.',
          'Capture emergency contact and training validity where applicable.',
          'Store role and current assignment eligibility consistently.',
        ],
      },
      {
        heading: 'Duty State Governance',
        body:
          'Driver status should reflect operational reality: available, on-trip, off-duty, or suspended. Assignment logic must respect these states.',
        points: [
          'Only available drivers should receive new trip assignments.',
          'Trips should auto-transition status where backend rules allow.',
          'Suspended drivers must be blocked from all dispatch actions.',
        ],
        example:
          'Example: A driver ending a trip should transition from on-trip to available only after closeout checks pass.',
      },
      {
        heading: 'Safety and Performance Monitoring',
        body:
          'Track delivery punctuality, complaints, safety score, and trip completion rate to drive coaching and risk reduction.',
        points: [
          'Review safety score trends weekly for early intervention.',
          'Use completion metrics for fair performance conversations.',
          'Correlate recurring complaints with route and schedule pressure.',
        ],
      },
    ],
    bestPractices: [
      'Apply backend validation for all driver status changes.',
      'Automate license expiry alerts at least 30 days in advance.',
      'Treat duty-hour compliance as a scheduling rule, not a suggestion.',
    ],
  },
  {
    id: 'employee-management',
    title: 'Employee Management',
    subtitle: 'Add, notify, deactivate, and recover employees with full auditability.',
    overview:
      'Employee management supports manager-controlled team operations with secure onboarding, soft deletion, recovery, and direct manager-to-employee communication flows.',
    highlights: ['Manager-only employee administration', 'Soft delete and recovery flow', 'Direct internal email communication'],
    sections: [
      {
        heading: 'Secure Employee Onboarding',
        body:
          'Managers add employees with role and basic identity details; driver role requires license data. Setup credentials are delivered through email setup flows.',
        points: [
          'Driver role requires license number, expiry, and category.',
          'Duplicate active emails are blocked by backend validation.',
          'In configured environments, setup links are used instead of manager-created passwords.',
        ],
      },
      {
        heading: 'Soft Delete and Recovery',
        body:
          'Employee deletion is soft-delete only. Records stay recoverable and are available in the deleted-employee list for controlled restoration.',
        points: [
          'Deleting an employee triggers a deactivation email notification.',
          'Recovery reactivates the user and triggers a recovery notification email.',
          'Historical records remain intact for audit and reporting.',
        ],
        example:
          'Example: If an employee is deleted by mistake, manager can recover from Deleted Employees tab without recreating history.',
      },
      {
        heading: 'Manager to Employee Email',
        body:
          'Managers can send structured email messages directly to an employee from the team module using subject and message content.',
        points: [
          'Recipient must belong to the same company scope.',
          'All payloads are validated on backend before sending.',
          'Use this channel for role updates, policy notices, or operational follow-ups.',
        ],
      },
    ],
    workflow: {
      heading: 'Employee Lifecycle Workflow',
      steps: [
        'Add employee with role and required fields.',
        'Employee receives setup/deployment notification by email.',
        'Manager may send direct informational emails when required.',
        'Delete and recover actions remain available with audit-safe soft deletion.',
      ],
    },
    bestPractices: [
      'Use local form-level error messaging in modals for faster resolution.',
      'Review deleted employee list periodically before permanent cleanup policies.',
      'Avoid assigning manager role through employee update flows.',
    ],
  },
  {
    id: 'trip-management',
    title: 'Trip Management',
    subtitle: 'Plan, assign, track, and close trips with operational consistency.',
    overview:
      'Trip management orchestrates dispatch execution from creation through delivery closure while capturing route, resource, and cost data needed by analytics and finance.',
    highlights: ['Trip lifecycle states', 'Driver and vehicle assignment rules', 'Operational and financial closure'],
    sections: [
      {
        heading: 'Trip Definition',
        body:
          'A trip should include route endpoints, cargo metadata, assigned resources, expected revenue, and key schedule markers.',
        points: [
          'Validate route data before assignment.',
          'Capture cargo weight to support capacity checks.',
          'Ensure revenue fields are present for post-trip profitability analysis.',
        ],
      },
      {
        heading: 'Lifecycle and Tracking',
        body:
          'Trips move through controlled states such as draft, dispatched, completed, and cancelled. State transitions should remain explicit and auditable.',
        points: [
          'Dispatched trips should reflect active operations.',
          'Cancelled trips should preserve cancellation reason where possible.',
          'Completed trips should trigger dependent updates for resources and metrics.',
        ],
      },
      {
        heading: 'Closeout and Reporting',
        body:
          'Trip completion should finalize operational fields and feed downstream dashboards and expense calculations.',
        points: [
          'Confirm end state before releasing vehicle and driver availability.',
          'Record expense and distance data to improve cost-per-km accuracy.',
          'Use closeout timestamps for SLA and punctuality reporting.',
        ],
      },
    ],
    bestPractices: [
      'Do not assign trips to inactive resources.',
      'Capture exceptional events (delay, reroute) immediately for auditability.',
      'Use status badges and filters to keep high-volume trip boards actionable.',
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    subtitle: 'Combine preventive scheduling with repair visibility and cost control.',
    overview:
      'Maintenance management reduces fleet downtime by combining schedule-driven service plans with corrective and emergency maintenance execution tracking.',
    highlights: ['Preventive and corrective categories', 'Service history tracking', 'Maintenance cost observability'],
    sections: [
      {
        heading: 'Maintenance Categories',
        body:
          'Classify every record as preventive, corrective, or emergency to support reliability analytics and budgeting.',
        points: [
          'Preventive records should follow mileage or date triggers.',
          'Corrective records should include issue source and failure detail.',
          'Emergency records should capture impact and response latency.',
        ],
      },
      {
        heading: 'Scheduling and Execution',
        body:
          'Service tasks should be planned against upcoming utilization and critical routes to minimize disruption.',
        points: [
          'Mark vehicles in non-assignable state while service is open.',
          'Capture labor and parts notes for each work order.',
          'Close records only after service outcome validation.',
        ],
      },
      {
        heading: 'Cost and Reliability Insights',
        body:
          'A complete service ledger enables trend analysis for high-cost assets and repetitive failures.',
        points: [
          'Compare planned versus unplanned maintenance spend.',
          'Track service frequency per vehicle by distance interval.',
          'Use history to improve replacement strategy and SLA planning.',
        ],
      },
    ],
    bestPractices: [
      'Prioritize preventive jobs before long-haul assignments.',
      'Attach invoices and diagnostic notes to every maintenance record.',
      'Investigate vehicles with repeated emergency repairs immediately.',
    ],
  },
  {
    id: 'expenses',
    title: 'Expenses and Costs',
    subtitle: 'Track spend categories and protect route-level profitability.',
    overview:
      'Expense management centralizes operational costs across fuel, maintenance, tolls, and personnel so finance and operations teams can make evidence-based decisions.',
    highlights: ['Category-based cost tracking', 'Trip and vehicle cost analytics', 'Budget versus actual monitoring'],
    sections: [
      {
        heading: 'Expense Categories',
        body:
          'Classify each cost into a consistent category taxonomy to keep reporting comparable across periods and fleets.',
        points: [
          'Fuel and toll charges should be tied to trips when possible.',
          'Maintenance costs should map back to vehicle and service records.',
          'Operational overhead should be visible separately from trip-variable costs.',
        ],
      },
      {
        heading: 'Cost Attribution',
        body:
          'Link expense entries to trip and vehicle context so dashboards can compute route-level profitability and cost-per-km trends.',
        points: [
          'Use standardized descriptions for repeatable reporting.',
          'Attach receipts and timestamps for audit confidence.',
          'Review large outlier entries before final monthly close.',
        ],
      },
      {
        heading: 'Optimization Strategy',
        body:
          'Use recurring analytics to identify high-cost routes, inefficient assets, and avoidable spend categories.',
        points: [
          'Compare profit per trip across route clusters.',
          'Track fuel-efficiency drift as an early maintenance signal.',
          'Use monthly trend reviews to drive vendor negotiations.',
        ],
      },
    ],
    bestPractices: [
      'Log expenses as close to transaction time as possible.',
      'Require attachments for high-value entries.',
      'Review category distribution monthly before budget decisions.',
    ],
  },
  {
    id: 'security',
    title: 'System Security and Privacy',
    subtitle: 'Understand authentication, authorization, and data isolation controls.',
    overview:
      'FleetFlow applies layered security controls across authentication, role authorization, and multi-tenant data isolation. Frontend checks improve UX, while backend enforcement provides real protection.',
    highlights: ['JWT session enforcement', 'Backend role verification', 'Company-level data isolation'],
    sections: [
      {
        heading: 'Authentication and Session Control',
        body:
          'Users authenticate with credentials and receive protected session tokens stored in secure cookies for authenticated requests.',
        points: [
          'Password values are hashed and never stored in plaintext.',
          'Token expiry policies reduce long-lived session risk.',
          'Forgot-password and setup-password flows are email verified.',
        ],
      },
      {
        heading: 'Authorization and RBAC',
        body:
          'Every protected operation checks allowed roles server-side. UI-level hiding of actions is not a security boundary.',
        points: [
          'Manager-only actions include employee create/delete/recover.',
          'Dispatcher access is intentionally constrained for safety.',
          'Unauthorized requests return forbidden responses from backend.',
        ],
      },
      {
        heading: 'Data Isolation and Auditability',
        body:
          'Company boundaries are enforced in data queries to prevent cross-tenant access and preserve privacy.',
        points: [
          'Records are scoped by company identifiers in backend logic.',
          'Soft deletes preserve audit trails and recovery options.',
          'Operational mutations should remain traceable for compliance reviews.',
        ],
      },
    ],
    bestPractices: [
      'Treat frontend permissions as usability hints, not security controls.',
      'Rotate email and auth secrets under a managed policy.',
      'Review access logs and role grants on a regular schedule.',
    ],
  },
  {
    id: 'rbac',
    title: 'Role-Based Access Control',
    subtitle: 'Map user roles to actions and protected application surfaces.',
    overview:
      'RBAC ensures each user can access only the modules and actions required by their operational role, reducing accidental and malicious misuse.',
    highlights: ['Role-scoped permissions', 'Protected routes and APIs', 'Least-privilege operations'],
    sections: [
      {
        heading: 'Core Roles',
        body:
          'FleetFlow supports manager, dispatcher, driver, safety officer, and financial analyst roles with defined capability boundaries.',
        points: [
          'Managers have team and operational administration permissions.',
          'Dispatchers coordinate trips but do not manage employee lifecycle.',
          'Specialized roles view analytics relevant to their domain.',
        ],
      },
      {
        heading: 'Dual-Layer Enforcement',
        body:
          'RBAC checks occur in frontend route guards and backend middleware. Backend checks are mandatory for all protected mutations.',
        points: [
          'Use frontend guards to avoid exposing inaccessible routes.',
          'Use backend middleware to block direct unauthorized requests.',
          'Keep permission maps centralized and versioned.',
        ],
      },
      {
        heading: 'Operational Governance',
        body:
          'Permission structures should evolve with organizational needs while preserving least-privilege defaults.',
        points: [
          'Review role grants during onboarding and offboarding events.',
          'Avoid broad role expansion for one-off operational needs.',
          'Audit failed authorization events for policy tuning.',
        ],
      },
    ],
    bestPractices: [
      'Validate role changes through manager-approved workflows.',
      'Document module ownership and expected access levels.',
      'Keep both UI and API permission rules synchronized.',
    ],
  },
  {
    id: 'email-notifications',
    title: 'Email Notifications',
    subtitle: 'Automate secure account and operational communication flows.',
    overview:
      'Email flows in FleetFlow support secure onboarding, password lifecycle, account-status communication, and direct manager-to-employee messages.',
    highlights: ['Account setup and recovery emails', 'Employee status notifications', 'Direct internal messaging'],
    sections: [
      {
        heading: 'Automated Account Emails',
        body:
          'The platform sends account setup, password reset, update, deactivation, and recovery emails with structured templates.',
        points: [
          'Setup links include token expiration windows for safety.',
          'Password reset success confirmation improves account security awareness.',
          'Employee update emails identify changed profile fields.',
        ],
      },
      {
        heading: 'Manager Communication Channel',
        body:
          'Managers can send direct messages to company employees from the application using subject and message payload validation.',
        points: [
          'Recipient identity is validated within same company boundary.',
          'Email content is formatted and delivered through configured SMTP provider.',
          'Failures return actionable API messages for retry.',
        ],
      },
      {
        heading: 'Configuration and Reliability',
        body:
          'Email delivery requires valid SMTP credentials and a client URL for generated links.',
        points: [
          'Use app-specific passwords with provider accounts where required.',
          'Validate transporter readiness during startup.',
          'Monitor delivery failures and bounce indicators in operational logs.',
        ],
      },
    ],
    workflow: {
      heading: 'Employee Messaging Flow',
      steps: [
        'Manager selects employee recipient from team view.',
        'Manager enters subject and message content.',
        'Backend validates recipient scope and payload.',
        'System sends formatted email and returns delivery status.',
      ],
    },
    bestPractices: [
      'Use clear subjects so employees can prioritize operational emails.',
      'Avoid sharing sensitive credentials or personal data via direct messages.',
      'Keep CLIENT_URL and email credentials aligned with current environment.',
    ],
  },
];

export const documentationById = documentationContent.reduce<Record<string, DocumentationArticle>>((acc, article) => {
  acc[article.id] = article;
  return acc;
}, {});
