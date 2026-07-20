# Changelog

All notable changes to this project will be documented in this file.

The format is based on **Keep a Changelog** and this project adheres to **Semantic Versioning (SemVer)**.

---

## [Unreleased]

### Added

* Add text gate status
* Filter menu helper
* Confirmation gate
* Filtering data integration
* Selisih on goodreceive
* Attribute14
* Approval gate, vehicle info and new Inspection
* Add service for gateActivity
* Assigned gate vehicle (initial)
* Add home button on movement, outbound, and inbound
* Handle approve after upload photos
* Integration logic, data filtering, and new mapping for status integration
* Add `vendor_po_number`
* Goodreceive plan-inspection
* Confirmation for integration
* Preview on approval gate
* Reject on Gate approval

### Changed

* Change SELISIH to GOOD-RK-1
* Rename project wmsnna
* Update checking pallet picking outbound
* Update movement
* Update vehicle gate
* Integrated not show
* Update filter by orgId
* Update get warehouse saat selisih
* Assigned gate update username
* Update using username fill name on loading
* Update get device into username
* Change user form device
* API ganti status outbound
* Update Assign dan Good receive
* Scan move to bottom
* Styling on scanner

### Fixed

* `status_inventory === ready` baru bisa dipake
* Validate Bug qtyping
* Header helper movement
* Multiple click on helper picking
* Data not showed up
* Doubleclick in Approval Gate, good receive, and picking
* Doubleclick button disabled after click
* INSPECTION disabled
* Logic button on inspection memo
* Format date outboundcard
* Delete picking pallet
* Helper submit handle
* Forklift check BIN Capacity
* Menu error and hide button
* Login state
* tsconfig
* Bug scanner camerascan
* Error dialog and filter subwarehouse !stg
* Upload photo error
* Update inventory case pallet code
* Wording login and popup hide
* Wording Assigned gate
* Editable false on edit pallet
* Menyesuaikan payload
* Menu scanner bottom
* Get pallet info

### Removed

* REMOVE CANCEL feature
* Remove `clg` (console.log)
* Remove log not necessary (PERF)

---

## [1.0.0] - 2026-01-19

### Added

* Initial release of the mobile application
* User authentication
* Basic navigation structure
* Dashboard screen

---

## [1.0.5] - 2026-04-01

### Changed

* Hide Button on Scan (helper)
* Change Wording for Inbound, Outbound and Movement
* Hide Integrated tab
* Update status when Scanning
* Change api and fetch on NewMemoInspection
* Make Pending on top view

## [1.0.6] - 2026-04-01

### Changed

* Handle error dialog on camera scan by error field
* Change style on button dialog 

### Added

* Confirmation dialog on inspection inbound

### Fixed

* Menu gate forklift not showed up because status "PENDING" change into "COMPLETED"