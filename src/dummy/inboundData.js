// inboundData.js

// Sample inboundListData for rendering
export const inboundListData = [
  {
    id: 1,
    title: 'PO/2025/12/04.0001',
    status: 'Active',
    statusColor: '#E5FFF2',
    inbound_plan_id: "5376503a-0d5f-45ad-bf85-d3a5b4a45e2c", // Add inbound_plan_id here for each item
  },
  {
    id: 2,
    title: 'PO/2025/12/04.0002',
    status: 'Active',
    statusColor: '#E5FFF2',
    inbound_plan_id: "a66d4aca-e9a4-4704-8a60-1621c2909b0a",
  },
  {
    id: 3,
    title: 'PO/2025/12/04.0003',
    status: 'Active',
    statusColor: '#E5FFF2',
    inbound_plan_id: "386b680f-d35f-4130-a6f8-1c6230a71c6f",
  },
];

// User ID to check against
export const userId = "c87a92d9-c3a3-4162-9f59-406615e5c138";

// Sample inboundData with checker_leader and checkers
export const inboundData = {
  "data": [
    {
      "id": "050f2170-2a0c-4d26-ae4e-30b68d7c61a4",
      "inbound_plan_id": "5376503a-0d5f-45ad-bf85-d3a5b4a45e2c",
      "checker_leader": {
        "id": "f210b47b-c39f-4382-9d6c-a7f54fe3da68",
        "username": "superadmin",
        "firstName": "Super",
        "lastName": "Admin"
      },
      "checkers": [
        {
          "id": "72e5ee0b-e5ff-4ff1-9b46-a76471511a89",
          "username": "ahres123",
          "firstName": "Ahres",
          "lastName": "Hebat"
        },
        {
          "id": "c87a92d9-c3a3-4162-9f59-406615e5c138",
          "username": "pandidepok",
          "firstName": "Pandi",
          "lastName": "Hebat"
        }
      ],
      "status": "ASSIGNED"
    },
    {
      "id": "6a53b7f2-1faa-4b7c-af67-cdb92994322c",
      "inbound_plan_id": "a66d4aca-e9a4-4704-8a60-1621c2909b0a",
      "checker_leader": {
        "id": "f210b47b-c39f-4382-9d6c-a7f54fe3da68",
        "username": "superadmin",
        "firstName": "Super",
        "lastName": "Admin"
      },
      "checkers": [
        {
          "id": "72e5ee0b-e5ff-4ff1-9b46-a76471511a89",
          "username": "ahres123",
          "firstName": "Ahres",
          "lastName": "Hebat"
        },
        {
          "id": "c87a92d9-c3a3-4162-9f59-406615e5c138",
          "username": "pandidepok",
          "firstName": "Pandi",
          "lastName": "Hebat"
        }
      ],
      "status": "ASSIGNED"
    }
  ]
};
